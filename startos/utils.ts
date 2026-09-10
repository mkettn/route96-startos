import { T, utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

// route96 listens on this port for both the Blossom/NIP-96 API and the
// bundled React dashboard — there is only ever one port to publish.
export const uiPort = 8000

export const uiMultiHostId = 'ui-multi'
export const uiInterfaceId = 'ui'

export const mariadbDatadir = '/var/lib/mysql'
export const dbName = 'route96'
export const dbUser = 'route96'

// Alphanumeric only: this password is embedded directly in a `mysql://` URL
// inside config.yaml, so it must never contain characters that are special
// in URL syntax (':', '@', '/', '%', etc).
const dbPasswordSpec = { charset: 'a-z,A-Z,1-9', len: 22 }

export function generateDbPassword(): string {
  return utils.getDefaultString(dbPasswordSpec)
}

export function buildDatabaseUrl(password: string): string {
  return `mysql://${dbUser}:${password}@127.0.0.1:3306/${dbName}`
}

// Inverse of buildDatabaseUrl — pulls the generated password back out of the
// connection string stored in config.yaml so it can be handed to the mariadb
// daemon as MYSQL_PASSWORD. Throws if the string isn't one we generated.
export function parseDbPassword(databaseUrl: string): string {
  const match = databaseUrl.match(/^mysql:\/\/[^:]+:([^@]+)@/)
  if (!match) {
    throw new Error('config.yaml "database" is not a recognized mysql:// URL')
  }
  return match[1]
}

// Every clearnet/Tor/LAN address StartOS has published for the `ui`
// interface, for the "Set Public URL" action to choose among.
export function getPublishedUrls(effects: T.Effects): Promise<string[]> {
  return sdk.host
    .getOwn(effects, uiMultiHostId, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === uiInterfaceId)
      return iface ? iface.addressInfo.nonLocal.format() : []
    })
    .const()
}

// route96 v0.7.0 layers a DB-backed config source on top of config.yaml
// (src/db_config.rs): on every start, `seed_from_settings` INSERT-IGNOREs
// each scalar config.yaml key into the `config` table, and any row already
// there always wins over the file from then on. Its skip list (keys the
// seeder deliberately leaves alone, e.g. `database`, `whitelist`) does NOT
// include `public_url` or `max_upload_bytes` in v0.7.0 — that omission was
// only fixed upstream after this image was built — so once the first boot
// seeds a row for either key, merely rewriting config.yaml is a no-op
// forever after. Write the same value straight into the `config` table
// (mirroring what `PUT /admin/config/{key}` does server-side) so an edit
// actually takes effect.
//
// CALL ORDER MATTERS: call this *before* the corresponding `configYaml.merge`.
// route96's config_watcher (src/config_watcher.rs) only rebuilds settings on
// a config-file modify event — despite its module doc comment claiming a
// periodic DB poll, no such poll exists (`DB_POLL_INTERVAL` is referenced
// only in comments, never defined) — and that rebuild re-reads the `config`
// table. Writing config.yaml first triggers a reload that still sees the old
// DB row; writing the DB row first means the file write's reload picks up
// the new value immediately instead of waiting for a restart.
//
// REMOVAL: once the image pin moves past upstream's fix (the `#93` commit
// that adds `public_url`/`max_upload_bytes` to `should_skip`), dropping this
// helper is not enough on its own — that fix only stops *seeding* those
// keys; `DbConfigSource::collect` still reads whatever rows already exist.
// Any row this helper ever wrote must also be deleted, e.g.
// `DELETE FROM config WHERE \`key\` IN ('public_url', 'max_upload_bytes')`,
// or the override keeps winning forever with no code left in this package
// able to change it. See UPDATING.md.
export async function setDbConfigOverride(
  effects: T.Effects,
  dbPassword: string,
  key: string,
  value: string,
): Promise<void> {
  // Backslash is MariaDB's default string-literal escape character (unless
  // NO_BACKSLASH_ESCAPES is set), so it must be escaped before quotes —
  // otherwise a value ending in '\' absorbs the closing quote and the rest
  // of the statement is parsed as SQL.
  const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "''")
  await sdk.SubContainer.withTemp(
    effects,
    { imageId: 'mariadb' },
    sdk.Mounts.of(),
    'route96-config-write',
    (sub) =>
      sub.execFail(
        [
          'mysql',
          '-h',
          '127.0.0.1',
          '-u',
          dbUser,
          dbName,
          '-e',
          `insert into config (\`key\`, \`value\`) values ('${key}', '${escaped}') on duplicate key update \`value\` = values(\`value\`), \`updated\` = current_timestamp;`,
        ],
        // MYSQL_PWD instead of -p<password>: the latter is visible in
        // /proc/<pid>/cmdline and makes mysql print its own "insecure"
        // warning to stderr on every call.
        { env: { MYSQL_PWD: dbPassword } },
      ),
  )
}

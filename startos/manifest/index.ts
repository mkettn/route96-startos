import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'route96',
  title: 'Route96',
  license: 'MIT',
  packageRepo: 'https://github.com/mkettn/route96-startos',
  upstreamRepo: 'https://github.com/v0l/route96',
  marketingUrl: 'https://github.com/v0l/route96',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'config', 'db'],
  images: {
    route96: {
      source: { dockerTag: 'voidic/route96:v0.7.0' },
      arch: ['x86_64', 'aarch64'],
    },
    // Pinned to the 10.x line deliberately — see UPDATING.md before bumping
    // to 11.x. MariaDB dropped the mysql/mysqldump/mysql_install_db
    // compatibility symlinks starting at 11.x; the SDK's Backups.withMysqlDump
    // (and this package's own setDbConfigOverride in utils.ts) invoke those
    // literal binary names unconditionally, so an 11.x image breaks both
    // backup/restore and the config write-through with
    // "No such file or directory (os error 2)".
    mariadb: {
      source: { dockerTag: 'mariadb:10.11.19' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})

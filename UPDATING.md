# Updating the upstream version

This package wraps upstream's own prebuilt image, published by
[v0l/route96](https://github.com/v0l/route96)'s CI to Docker Hub as
`voidic/route96`. MariaDB is pulled from the official `mariadb` image and
updated independently.

## Determining the upstream version

- **route96** ([v0l/route96](https://github.com/v0l/route96)) — fetch the
  latest release tag:

  ```sh
  git ls-remote --tags https://github.com/v0l/route96 | tail -5
  ```

  Confirm the corresponding image was actually published (multi-arch, both
  `amd64` and `arm64`) before pinning it — only tagged pushes build
  `linux/amd64,linux/arm64`; a plain `latest` build off `main` is
  `amd64`-only:

  ```sh
  curl -s 'https://hub.docker.com/v2/repositories/voidic/route96/tags/<version>' | jq '.images[] | {arch: .architecture, os: .os}'
  ```

  The current pin lives in `startos/manifest/index.ts` at
  `images['route96'].source.dockerTag` (the version after the `:` in
  `voidic/route96:<version>`, tags keep the leading `v`, e.g. `v0.7.0`).

- **mariadb** (official image) — check for a new patch release within the
  same major.minor (`10.11.x`) before jumping minors; a minor bump can change
  on-disk data format. The pin lives in the same file at
  `images['mariadb'].source.dockerTag`.

  **Stay on the 10.x line.** MariaDB removed the `mysql`/`mysqldump`/
  `mysql_install_db` compatibility symlinks starting at 11.x — verify with:

  ```sh
  docker run --rm mariadb:<candidate-tag> sh -c 'ls -la /usr/bin/mysql /usr/bin/mysqldump'
  ```

  If that fails, don't pin it: the SDK's `Backups.withMysqlDump` (used in
  `backups.ts`) and this package's own `setDbConfigOverride` (`utils.ts`)
  both invoke those literal binary names unconditionally. An image without
  them breaks backup/restore and every "Set Public URL"/"Edit Settings"
  action call with `... failed with exit code 2: Filesystem I/O Error: No
  such file or directory (os error 2)` — the exact symptom that got this
  pin added in the first place. Also note that MariaDB cannot downgrade a
  data directory across major versions, so an install that already ran
  under a broken 11.x pin needs a fresh install, not just this fix.

## Applying the bump

1. Bump `dockerTag` in `startos/manifest/index.ts` for whichever image
   changed.
2. If route96's own `config.yaml` schema changed upstream (new required key,
   renamed key, etc. — check `src/settings.rs` in the upstream repo), update
   `startos/fileModels/config.yaml.ts` to match, and add a version migration
   in `startos/versions/` if existing installs need their `config.yaml`
   rewritten.
3. Bump `version` in `startos/versions/current.ts` to
   `<route96 version>:<package revision>`, resetting the revision to `0` on
   a route96 version bump, incrementing it for a packaging-only change.
4. **If the route96 bump crosses the `#93` fix** (the commit that adds
   `public_url` and `max_upload_bytes` to `should_skip` in
   `src/db_config.rs` — check with
   `git log --oneline -- src/db_config.rs` in the upstream repo, or just
   diff `should_skip` between the old and new tag), `setDbConfigOverride`
   in `startos/utils.ts` and its two call sites
   (`startos/actions/setPublicUrl.ts`, `startos/actions/editSettings.ts`)
   become dead weight, but removing them is a **two-step**, not one:
   - Drop the helper and its call sites (`configYaml.merge` alone is
     sufficient again once upstream stops seeding these keys from the
     file).
   - **Also** delete the rows this package ever wrote, against the
     `route96` database:

     ```sql
     DELETE FROM config WHERE `key` IN ('public_url', 'max_upload_bytes');
     ```

     `should_skip` only gates *seeding*; `DbConfigSource::collect` still
     reads whatever rows already exist, so skipping this second step
     leaves this package's old overrides in permanent effect with no code
     left able to change them. A migration in `startos/versions/` is the
     right place to run that `DELETE` for existing installs.

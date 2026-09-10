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
  same major.minor (`11.4.x`) before jumping minors; a minor bump can change
  on-disk data format. The pin lives in the same file at
  `images['mariadb'].source.dockerTag`.

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

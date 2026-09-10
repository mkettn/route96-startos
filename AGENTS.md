# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

This package wraps [route96](https://github.com/v0l/route96), a Nostr blob
storage server (Blossom + NIP-96), for real use — it is not the minimal
reference/smoke-test package (that's Start9's own `hello-world-startos`; see
its `AGENTS.md` if you need that pattern instead).

- **Two images, not one.** `route96` (upstream's own prebuilt
  `voidic/route96` from Docker Hub) and `mariadb` (official image) run as
  separate daemons in the same package; `route96` requires `mariadb`.
  amd64/arm64 only — route96 does not publish a riscv64 image, so don't add
  that arch here.
- **The database is real state, not a smoke test.** `db` (MariaDB's data
  directory) is backed up via `mysqldump`
  (`sdk.Backups.withMysqlDump()`), not rsynced raw. `main` (uploaded blobs)
  and `config` (the generated `config.yaml`, including the database
  password) are rsynced. If you add config surface, keep the
  `startos/fileModels/config.yaml.ts` shape close to upstream's actual
  `Settings` struct (`src/settings.rs` in the upstream repo) — see its
  doc comment convention.
- **Admin auth is upstream's, not this package's.** The first pubkey to hit
  an admin endpoint becomes admin; there is no admin-credential action to
  maintain here. Don't add one.
- See `UPDATING.md` for how the two image pins get bumped, and `README.md`
  for the full inventory of what this package does and deliberately doesn't
  configure (AI labeling, payments, legacy void.cat import).

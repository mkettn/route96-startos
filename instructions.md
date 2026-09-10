# Route96

Route96 stores images, video, and other files for Nostr clients using the
Blossom and NIP-96 protocols. This page covers the StartOS-specific setup
step and where to read more. (If you're a developer, see `README.md` for the
technical reference.)

## Documentation

- [Route96 upstream docs](https://github.com/v0l/route96/blob/master/README.md) —
  the README for the server this package runs, including its full API
  reference.
- [Route96 admin API docs](https://github.com/v0l/route96/blob/master/docs/admin-api.md) —
  moderation, user management, and dynamic config endpoints, all reachable
  from the built-in dashboard.
- [StartOS Packaging Guide](https://docs.start9.com/packaging) — how this
  package itself is built.

## Getting set up

1. Install and start Route96. The first start takes a little longer than
   usual — MariaDB is initializing its data directory.
2. Open the **Actions** tab and run **Set Public URL**. Pick whichever of
   your published addresses (clearnet, Tor .onion, or LAN) you want Route96
   to hand back to clients in upload responses and advertise at
   `/.well-known/nostr/nip96.json`. This step matters: until it's set,
   uploaded files get URLs that don't point anywhere, and the "Public URL"
   health check on the Dashboard tab will show failing.
3. Open the **Web UI** interface to reach the dashboard.
4. Authenticate with any Nostr key you control (a NIP-98-signed request) —
   whichever pubkey does this **first** is automatically made an admin.
   Everyone after that starts as a regular user. If you want to restrict who
   can even upload, use that admin session to manage the whitelist from the
   dashboard, then flip on whitelisting in the **Edit Settings** action
   below.
5. Point a Nostr client (or any Blossom/NIP-96-compatible app) at your
   chosen public URL to start uploading.

## What you get on StartOS

- **A running Route96 server** — Blossom and NIP-96 uploads, a dashboard for
  moderation, thumbnails, and WebP conversion — backed by a MariaDB database
  StartOS manages for you (random credentials, automatic backup/restore).
- **Two actions**, reachable from the Actions tab:
  - **Set Public URL** — pick the address embedded in upload responses.
  - **Edit Settings** — set the max upload size, and toggle the
    database-backed whitelist that restricts uploads to pubkeys you approve
    from the dashboard.
- Everything else — banning users, reviewing flagged uploads, viewing
  storage stats — is managed from Route96's own dashboard, not from StartOS.

## Limitations

- No AI content labeling and no Lightning-backed paid storage quotas — see
  `README.md` for why.
- The upload whitelist, when enabled, is always the database-backed kind
  managed from the dashboard; a static list or a hot-reloaded file (both of
  which upstream also supports) isn't exposed here.
- There's no admin-credential setup step to hold the service on a task —
  admin status is granted to the first authenticated pubkey by Route96
  itself, exactly as it would be on any other Route96 install.

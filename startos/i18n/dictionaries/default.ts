export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Route96!': 0,
  'config.yaml not found': 1,
  'No public URL is set. Links to uploaded files will be broken until the "Set Public URL" action is run.': 2,
  'Web Interface': 3,
  'The web interface is ready': 4,
  'The web interface is not ready': 5,
  'Public URL': 6,
  'Uploaded files are linked from ${url}': 7,
  'No public URL is set. Use the "Set Public URL" action to select one.': 8,
  Database: 19,
  'MariaDB is not accepting connections': 20,

  // interfaces.ts
  'Web UI': 9,
  'The route96 dashboard, and the address Nostr clients use for Blossom/NIP-96 uploads': 10,

  // actions/setPublicUrl.ts
  'Set Public URL': 11,
  'Choose which of your published addresses route96 should embed in upload links and advertise to Nostr clients as its public URL.': 12,
  'No published address is available to select yet. Wait for a clearnet/Tor/LAN address to come up, then try again.': 21,

  // actions/editSettings.ts
  'Max Upload Size': 13,
  'The largest file a single upload may be.': 14,
  'Restrict Uploads to Whitelisted Pubkeys': 15,
  'When enabled, only pubkeys added to the whitelist from the route96 admin dashboard may upload files. Downloads remain open to everyone either way.': 16,
  'Edit Settings': 17,
  'Configure the upload size limit and upload whitelist.': 18,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiInterfaceId, uiMultiHostId, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, uiMultiHostId)
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: uiInterfaceId,
    description: i18n(
      'The route96 dashboard, and the address Nostr clients use for Blossom/NIP-96 uploads',
    ),
    type: 'ui',
    // Unmasked: Nostr clients (Blossom uploaders, NIP-96 clients) need the
    // real address to talk to the API directly, not just a proxied UI link.
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const uiReceipt = await uiMultiOrigin.export([ui])

  return [uiReceipt]
})

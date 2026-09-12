import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.7.0:0',
  releaseNotes: {
    en_US: 'Initial release, packaging route96 v0.7.0.',
    es_ES: 'Lanzamiento inicial, empaquetando route96 v0.7.0.',
    de_DE: 'Erstveröffentlichung, verpackt route96 v0.7.0.',
    pl_PL: 'Pierwsze wydanie, pakujące route96 v0.7.0.',
    fr_FR: 'Version initiale, empaquetant route96 v0.7.0.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

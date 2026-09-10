import { configYaml, storageDir } from './fileModels/config.yaml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  dbName,
  dbUser,
  mariadbDatadir,
  parseDbPassword,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting Route96!'))

  const config = await configYaml.read().const(effects)
  if (!config) throw new Error(i18n('config.yaml not found'))

  const dbPassword = parseDbPassword(config.database)

  if (!config.public_url) {
    console.warn(
      i18n(
        'No public URL is set. Links to uploaded files will be broken until the "Set Public URL" action is run.',
      ),
    )
  }

  /**
   * ======================== Set containers ========================
   */
  const mariadbSub = sdk.SubContainer.of(
    effects,
    { imageId: 'mariadb' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'db',
      subpath: null,
      mountpoint: mariadbDatadir,
      readonly: false,
    }),
    'mariadb-sub',
  )

  const route96Sub = sdk.SubContainer.of(
    effects,
    { imageId: 'route96' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: storageDir,
        readonly: false,
      })
      .mountVolume({
        volumeId: 'config',
        subpath: 'config.yaml',
        mountpoint: '/app/config.yaml',
        readonly: true,
        type: 'file',
      }),
    'route96-sub',
  )

  /**
   * ======================== Daemons ========================
   */
  return sdk.Daemons.of(effects)
    .addDaemon('mariadb', {
      subcontainer: mariadbSub,
      exec: {
        command: sdk.useEntrypoint(['--bind-address=127.0.0.1']),
        env: {
          MARIADB_RANDOM_ROOT_PASSWORD: '1',
          MYSQL_DATABASE: dbName,
          MYSQL_USER: dbUser,
          MYSQL_PASSWORD: dbPassword,
        },
      },
      ready: {
        display: null,
        gracePeriod: 120_000,
        fn: async () => {
          const res = await mariadbSub.exec([
            'healthcheck.sh',
            '--connect',
            '--innodb_initialized',
          ])
          return {
            result: res.exitCode === 0 ? 'success' : 'loading',
            message: null,
          }
        },
      },
      requires: [],
    })
    .addDaemon('route96', {
      subcontainer: route96Sub,
      exec: {
        command: sdk.useEntrypoint(),
        env: { RUST_LOG: 'info' },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['mariadb'],
    })
    .addHealthCheck('public-url', {
      ready: {
        display: i18n('Public URL'),
        fn: async () => {
          const current = await configYaml
            .read((c) => c.public_url)
            .const(effects)
          return current
            ? {
                result: 'success',
                message: i18n('Uploaded files are linked from ${url}', {
                  url: current,
                }),
              }
            : {
                result: 'failure',
                message: i18n(
                  'No public URL is set. Use the "Set Public URL" action to select one.',
                ),
              }
        },
      },
      requires: ['route96'],
    })
})

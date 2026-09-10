import { configYaml } from './fileModels/config.yaml'
import { sdk } from './sdk'
import { dbName, dbUser, mariadbDatadir, parseDbPassword } from './utils'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withMysqlDump({
    imageId: 'mariadb',
    dbVolume: 'db',
    datadir: mariadbDatadir,
    database: dbName,
    user: dbUser,
    password: async () => {
      const config = await configYaml.read().once()
      if (!config) throw new Error('config.yaml not found')
      return parseDbPassword(config.database)
    },
    engine: 'mariadb',
  })
    .addVolume('main')
    .addVolume('config'),
)

import { configYaml } from './fileModels/config.yaml'
import { sdk } from './sdk'
import { dbName, dbUser, mariadbDatadir, parseDbPassword } from './utils'

// withMysqlDump execs the literal mysqldump/mysql/mysql_install_db binary
// names regardless of `engine`, which is why the mariadb image pin
// (manifest/index.ts) is held to the 10.x line — 11.x dropped those compat
// symlinks and this would fail with "No such file or directory (os error 2)".
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

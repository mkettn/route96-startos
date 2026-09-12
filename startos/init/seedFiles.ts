import { configYaml } from '../fileModels/config.yaml'
import { sdk } from '../sdk'
import { buildDatabaseUrl, generateDbPassword } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await configYaml.merge(effects, {
      database: buildDatabaseUrl(generateDbPassword()),
    })
  } else {
    await configYaml.merge(effects, {})
  }
})

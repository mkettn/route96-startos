import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { uiPort } from '../utils'

export const storageDir = '/app/data'
export const defaultMaxUploadBytes = 1_073_741_824 // 1 GiB

const shape = z.object({
  // enforced — the container's internal listen address and data directory
  // never change; they are wired to the daemon's mounts, not user input.
  listen: z.literal(`0.0.0.0:${uiPort}`).catch(`0.0.0.0:${uiPort}`),
  storage_dir: z.literal(storageDir).catch(storageDir),

  // Generated once at install and left alone afterward — see init/seedFiles.
  database: z.string().catch(''),

  // configurable via actions/editSettings and actions/setPublicUrl
  max_upload_bytes: z.number().int().positive().catch(defaultMaxUploadBytes),
  public_url: z.string().catch(''),
  // Database-backed whitelist (managed from the route96 admin UI). Omit the
  // key entirely to allow everyone — route96 treats `whitelist: false` as a
  // config error, so this is never written as `false`.
  whitelist: z.literal(true).optional().catch(undefined),
})

export const configYaml = FileHelper.yaml(
  { base: sdk.volumes.config, subpath: '/config.yaml' },
  shape,
)

export type ConfigYaml = z.infer<typeof shape>

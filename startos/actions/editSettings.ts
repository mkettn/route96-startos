import { configYaml, defaultMaxUploadBytes } from '../fileModels/config.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { parseDbPassword, setDbConfigOverride } from '../utils'

const { InputSpec, Value } = sdk

const BYTES_PER_MB = 1024 * 1024

export const inputSpec = InputSpec.of({
  maxUploadMb: Value.number({
    name: i18n('Max Upload Size'),
    description: i18n('The largest file a single upload may be.'),
    warning: null,
    footnote: null,
    default: Math.round(defaultMaxUploadBytes / BYTES_PER_MB),
    required: true,
    min: 1,
    max: null,
    step: 1,
    integer: true,
    units: 'MB',
    placeholder: null,
  }),
  whitelist: Value.toggle({
    name: i18n('Restrict Uploads to Whitelisted Pubkeys'),
    description: i18n(
      'When enabled, only pubkeys added to the whitelist from the route96 admin dashboard may upload files. Downloads remain open to everyone either way.',
    ),
    default: false,
  }),
})

export const editSettings = sdk.Action.withInput(
  // id
  'edit-settings',

  // metadata
  async () => ({
    name: i18n('Edit Settings'),
    description: i18n('Configure the upload size limit and upload whitelist.'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill the input form with the current settings
  async () => {
    const config = await configYaml.read().once()
    return {
      maxUploadMb: config
        ? Math.round(config.max_upload_bytes / BYTES_PER_MB)
        : undefined,
      whitelist: !!config?.whitelist,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const config = await configYaml.read().once()
    if (!config) throw new Error('config.yaml not found')

    const maxUploadBytes = input.maxUploadMb * BYTES_PER_MB
    await configYaml.merge(effects, {
      max_upload_bytes: maxUploadBytes,
      // `whitelist` is exempt from route96's DB config layer (see
      // setDbConfigOverride) — the file alone governs it, no write-through
      // needed.
      whitelist: input.whitelist ? true : undefined,
    })

    // config.yaml alone is not enough for max_upload_bytes — see
    // setDbConfigOverride for why.
    await setDbConfigOverride(
      effects,
      parseDbPassword(config.database),
      'max_upload_bytes',
      String(maxUploadBytes),
    )
  },
)

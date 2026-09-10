import { configYaml } from '../fileModels/config.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getPublishedUrls } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const urls = await getPublishedUrls(effects)

    return {
      name: i18n('Public URL'),
      values: urls.reduce(
        (obj, url) => ({ ...obj, [url]: url }),
        {} as Record<string, string>,
      ),
      default: '',
    }
  }),
})

export const setPublicUrl = sdk.Action.withInput(
  // id
  'set-public-url',

  // metadata
  async () => ({
    name: i18n('Set Public URL'),
    description: i18n(
      'Choose which of your published addresses route96 should embed in upload links and advertise to Nostr clients as its public URL.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill the input form with the currently configured URL
  async () => ({
    url: (await configYaml.read((c) => c.public_url).once()) || undefined,
  }),

  // the execution function
  async ({ effects, input }) =>
    configYaml.merge(effects, { public_url: input.url }),
)

import { configYaml } from '../fileModels/config.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  getPublishedUrls,
  parseDbPassword,
  setDbConfigOverride,
} from '../utils'

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
      // Falls back to '' when nothing is published yet (e.g. immediately
      // after install, before any interface address is up) — '' is never a
      // legal selection, so the execution function below rejects it rather
      // than silently clearing a previously configured URL.
      default: urls[0] ?? '',
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
    // Setting this requires a live mariadb to write the DB-side override
    // through to (see setDbConfigOverride) — a stopped service has neither
    // that connection nor, on a never-started install, the `config` table
    // migrations create at first boot.
    allowedStatuses: 'only-running',
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
  async ({ effects, input }) => {
    if (!input.url) {
      throw new Error(
        i18n(
          'No published address is available to select yet. Wait for a clearnet/Tor/LAN address to come up, then try again.',
        ),
      )
    }

    const config = await configYaml.read().once()
    if (!config) throw new Error(i18n('config.yaml not found'))

    // Must precede the config.yaml write below — see setDbConfigOverride's
    // "CALL ORDER MATTERS" note. route96 only rebuilds its settings on a
    // config-file event, and that rebuild is what picks up this row.
    await setDbConfigOverride(
      effects,
      parseDbPassword(config.database),
      'public_url',
      input.url,
    )

    await configYaml.merge(effects, { public_url: input.url })
  },
)

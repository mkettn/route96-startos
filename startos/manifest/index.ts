import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'route96',
  title: 'Route96',
  license: 'MIT',
  packageRepo: 'https://github.com/mkettn/route96-startos',
  upstreamRepo: 'https://github.com/v0l/route96',
  marketingUrl: 'https://github.com/v0l/route96',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'config', 'db'],
  images: {
    route96: {
      source: { dockerTag: 'voidic/route96:v0.7.0' },
      arch: ['x86_64', 'aarch64'],
    },
    mariadb: {
      source: { dockerTag: 'mariadb:11.4.13' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})

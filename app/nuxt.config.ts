import { extensions } from '@libertech-fr/teaket_common'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  telemetry: false,
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  modules: [
    ...extensions.setup.app(),
  ],
})

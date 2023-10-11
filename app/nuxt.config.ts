import appSetup from './src/extension.app.setup'
import pugPlugin from 'vite-plugin-pug'
import openapiTS from 'openapi-typescript'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const TK_APP_API_URL = process.env.TK_APP_API_URL || 'http://localhost:7100'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  telemetry: false,
  pages: true,
  srcDir: 'src',
  debug: !!process.env.DEBUG,
  devServer: {
    port: 7000,
  },
  devtools: {
    enabled: process.env.NODE_ENV === 'development',
    timeline: {
      enabled: true,
    },
  },
  plugins: [{ src: '~/plugins/ofetch' }],
  components: {
    global: true,
    dirs: [{ path: '~/components', prefix: 'tk' }],
  },
  modules: ['@nuxt-alt/auth', '@nuxt-alt/http', '@pinia/nuxt', 'nuxt-quasar-ui', '@vueuse/nuxt', 'dayjs-nuxt', ...appSetup()],
  auth: {
    globalMiddleware: true,
    rewriteRedirects: true,
    watchLoggedIn: true,
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'access_token',
          maxAge: 60 * 5,
        },
        refreshToken: {
          property: 'refresh_token',
          data: 'refresh_token',
          maxAge: 60 * 60 * 4,
        },
        user: {
          property: 'user',
          autoFetch: true,
        },
        clientId: false,
        grantType: false,
        endpoints: {
          login: { url: `${TK_APP_API_URL}/core/auth/local`, method: 'post', headers: { 'Content-Type': 'application/json' } },
          refresh: { url: `${TK_APP_API_URL}/core/auth/refresh`, method: 'post', headers: { 'Content-Type': 'application/json' } },
          logout: { url: `${TK_APP_API_URL}/core/auth/logout`, method: 'post' },
          user: { url: `${TK_APP_API_URL}/core/auth/session`, method: 'get', propertyName: 'user' },
        },
        redirect: {
          logout: '/login',
          login: '/',
        },
        tokenType: 'Bearer',
        autoRefresh: true,
      },
    },
  },
  dayjs: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    defaultTimezone: 'Paris',
    plugins: ['timezone', 'relativeTime'],
  },
  pinia: {
    autoImports: ['defineStore'],
  },
  appConfig: {
    customSlots: {},
  },
  quasar: {
    iconSet: 'mdi-v5',
    plugins: ['Notify'],
    config: {
      dark: 'auto',
      notify: {
        timeout: 2500,
        position: 'top-right',
        actions: [{ icon: 'mdi-close', color: 'white' }],
      },
    },
  },
  vite: {
    define: {
      'process.env.DEBUG': process.env.NODE_ENV === 'development',
    },
    plugins: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pugPlugin(<any>{
        pretty: true,
        compilerOptions: {},
      }),
    ],
  },
  alias: {
    cookie: resolve(__dirname, '../node_modules/cookie'),
  },
  experimental: {
    typescriptBundlerResolution: true,
  },
  typescript: {
    // typeCheck: 'build,
    shim: false,
  },
  hooks: {
    ready: async () => {
      console.log('[OpenapiTS] Generating .nuxt/types/service-api.d.ts...')
      try {
        const fileData = await openapiTS(`${TK_APP_API_URL}/swagger/json`)
        writeFileSync('.nuxt/types/service-api.d.ts', fileData)
        console.log('[OpenapiTS] Generated .nuxt/types/service-api.d.ts !')
      } catch (error) {
        console.debug('[OpenapiTS] Error while generating .nuxt/types/service-api.d.ts', error)
      }
    },
  },
})

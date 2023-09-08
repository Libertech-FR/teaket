import { extensions } from '@libertech-fr/teaket_common'
import pugPlugin from 'vite-plugin-pug'
import { resolve } from 'node:path'

const TK_APP_API_URL = process.env.TK_APP_API_URL || 'http://localhost:7100'
const TK_APP_AUTH_SECRET = process.env.TK_APP_AUTH_SECRET

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
  modules: ['nuxt-api-party', '@sidebase/nuxt-auth', 'nuxt-quasar-ui', '@vueuse/nuxt', 'dayjs-nuxt', ...extensions.appSetup.default()],
  dayjs: {
    locales: ['fr'],
    defaultLocale: 'fr',
  },
  auth: {
    baseURL: `${TK_APP_API_URL}/core/auth`,
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        signUp: { path: '/register', method: 'post' },
        getSession: { path: '/session', method: 'get' },
      },
      pages: {
        login: '/login',
      },
    },
    session: {
      enableRefreshOnWindowFocus: true,
      enableRefreshPeriodically: 5 * 60 * 1_000,
    },
    globalAppMiddleware: {
      isEnabled: true,
    },
  },
  runtimeConfig: {
    authJs: {
      secret: TK_APP_AUTH_SECRET,
    },
    public: {
      authJs: {
        // baseUrl: process.env.NUXT_NEXTAUTH_URL, // The URL of your deployed app (used for origin Check in production)
        verifyClientOnEveryRequest: true, // whether to hit the /auth/session endpoint on every client request
      },
    },
  },
  appConfig: {
    customSlots: {},
  },
  quasar: {
    iconSet: 'mdi-v5',
  },
  apiParty: {
    endpoints: {
      api: {
        url: TK_APP_API_URL,
        schema: `${TK_APP_API_URL}/swagger/json`,
        cookies: true,
      },
    },
    allowClient: true,
  },
  vite: {
    define: {
      'process.env.DEBUG': process.env.NODE_ENV === 'development',
    },
    plugins: [
      pugPlugin(<any>{
        pretty: true,
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
})

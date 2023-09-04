import { extensions } from '@libertech-fr/teaket_common'
import pugPlugin from 'vite-plugin-pug'
import { resolve } from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  telemetry: false,
  pages: true,
  srcDir: 'src',
  debug: !!process.env.DEBUG,
  devServer: {
    port: 8000,
  },
  devtools: {
    enabled: process.env.NODE_ENV === 'development',
    timeline: {
      enabled: true,
    },
  },
  plugins: [
    { src: '~/plugins/ofetch' },
  ],
  components: {
    global: true,
    dirs: [{ path: '~/components', prefix: 'tk' }],
  },
  modules: [
    'nuxt-api-party',
    // '@hebilicious/authjs-nuxt',
    // '@nuxtjs/auth-next',
    '@sidebase/nuxt-auth',
    'nuxt-quasar-ui',
    ...extensions.appSetup.default(),
  ],
  auth: {
    baseURL: 'http://localhost:9000/core/auth',
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
      enableRefreshPeriodically: 5000,
    },
    globalAppMiddleware: {
      isEnabled: true,
    },
  },
  runtimeConfig: {
    authJs: {
      secret: process.env.AUTH_SECRET,
    },
    github: {
      clientId: process.env.NUXT_GITHUB_CLIENT_ID,
      clientSecret: process.env.NUXT_GITHUB_CLIENT_SECRET,
    },
    public: {
      authJs: {
        baseUrl: process.env.NUXT_NEXTAUTH_URL, // The URL of your deployed app (used for origin Check in production)
        verifyClientOnEveryRequest: true, // whether to hit the /auth/session endpoint on every client request
      },
    },
  },
  quasar: {},
  apiParty: {
    endpoints: {
      api: {
        url: `${process.env.NUXT_API_URL}`,
        schema: `${process.env.NUXT_API_URL}/swagger/json`,
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

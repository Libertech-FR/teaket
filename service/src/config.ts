import { JwtModuleOptions } from '@nestjs/jwt'
import { MongooseModuleOptions } from '@nestjs/mongoose'
import { IAuthModuleOptions } from '@nestjs/passport'
import { SwaggerCustomOptions } from '@nestjs/swagger'
import { HelmetOptions } from 'helmet'
import { RedisOptions } from 'ioredis'

export interface MongoosePlugin {
  package: string
  enabled?: boolean
  options?: Record<string, any>
}

export interface ConfigInstance {
  helmet: HelmetOptions
  mongoose: {
    uri: string
    options: MongooseModuleOptions
    plugins: MongoosePlugin[]
  }
  ioredis: {
    uri: string
    options: RedisOptions
  }
  passport: {
    options: IAuthModuleOptions
  }
  jwt: {
    options: JwtModuleOptions
  }
  // oidc: {
  //   options: BuildOpenIdClientOptions
  // }
  i18n: {
    fallbackLanguage: string
  }
  swagger: {
    path: string
    api: string
    options?: SwaggerCustomOptions
  }
}

export default (): ConfigInstance => ({
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        objectSrc: ["'self'"],
        frameSrc: ["'self'"],
        styleSrc: ["'self'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'"],
        scriptSrc: ["'self'"],
      },
    },
  },
  mongoose: {
    uri: process.env.TK_SERVICE_MONGOOSE_URI,
    options: {},
    plugins: [
      {
        package: 'mongoose-unique-validator',
        enabled: true,
        options: {
          message: 'Erreur, expected {PATH} to be unique.',
        },
      },
    ],
  },
  ioredis: {
    uri: process.env.TK_SERVICE_IOREDIS_URI,
    options: {
      showFriendlyErrorStack: true,
    },
  },
  passport: {
    options: {
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    },
  },
  jwt: {
    options: {
      /**
       * @see https://randomkeygen.com/
       */
      secret: process.env.TK_SERVICE_JWT_SECRET,
      // jwksUri: 'http://127.0.0.1:2000/jwks',
    },
  },
  // oidc: {
  //   options: {
  //     discover: process.env.TEAKET_OIDC_DISCOVER,
  //     client: {
  //       client_id: process.env.TEAKET_OIDC_CLIENT_ID,
  //       client_secret: process.env.TEAKET_OIDC_CLIENT_SECRET,
  //     },
  //     params: {
  //       scope: 'openid profile email',
  //       redirect_uri: process.env.TEAKET_OIDC_PARAMS_REDIRECT_URI,
  //     },
  //   },
  // },
  i18n: {
    fallbackLanguage: 'en',
  },
  swagger: {
    path: '/swagger',
    api: '/swagger/json',
    options: {
      swaggerOptions: {
        persistAuthorization: true,
      },
    },
  },
})

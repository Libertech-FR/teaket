import { JwtModuleOptions } from '@nestjs/jwt'
import { MongooseModuleOptions } from '@nestjs/mongoose'
import { IAuthModuleOptions } from '@nestjs/passport'
import { SwaggerCustomOptions } from '@nestjs/swagger'
import { HelmetOptions } from 'helmet'
import { RedisOptions } from 'ioredis'

export interface ConfigInstance {
  helmet: HelmetOptions
  mongoose: {
    uri: string
    options: MongooseModuleOptions
    plugins: {
      muv: {
        options: Record<string, any>
      }
    }
  }
  ioredis: {
    uri: string
    options: RedisOptions
  }
  passport: {
    options: IAuthModuleOptions
  }
  jwt: {
    options: JwtModuleOptions & any
  }
  // oidc: {
  //   options: BuildOpenIdClientOptions
  // }
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
    uri: process.env.TEAKET_MONGOOSE_URI,
    options: {},
    plugins: {
      muv: {
        options: {
          message: 'Erreur, expected {PATH} to be unique.',
        },
      },
    },
  },
  ioredis: {
    uri: process.env.TEAKET_IOREDIS_URI,
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
      secret: process.env.TEAKET_JWT_SECRET,
      jwksUri: 'http://127.0.0.1:2000/jwks',
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

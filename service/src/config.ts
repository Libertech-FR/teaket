import { JwtModuleOptions } from '@nestjs/jwt'
import { MongooseModuleOptions } from '@nestjs/mongoose'
import { IAuthModuleOptions } from '@nestjs/passport'
import { SwaggerCustomOptions } from '@nestjs/swagger'
import { HelmetOptions } from 'helmet'
import { RedisOptions } from 'ioredis'
import * as process from 'process'
import { StorageManagerConfig } from '@streamkits/nestjs_module_factorydrive'
import { AmazonWebServicesS3StorageConfig } from '@streamkits/nestjs_module_factorydrive-s3'
import { Settings } from '~/core/settings/settings.interface'

export interface MongoosePlugin {
  package: string
  enabled?: boolean
  options?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ConfigInstance {
  application: {
    bodyParser: {
      limit: string
    }
  }
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
  factorydrive: {
    options:
      | StorageManagerConfig
      | {
          disks: {
            [key: string]: {
              driver: 's3'
              config: AmazonWebServicesS3StorageConfig
            }
          }
        }
  }
  settings: Settings
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
  application: {
    bodyParser: {
      limit: '500mb',
    },
  },
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
    options: {
      directConnection: true,
    },
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
  factorydrive: {
    options: {
      default: 'local',
      disks: {
        local: {
          driver: 'local',
          config: {
            root: process.cwd() + '/storage',
          },
        },
        s3: {
          driver: 's3',
          config: {
            credentials: {
              accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
              secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            },
            endpoint: 'http://localhost:9000/',
            region: 'us-east-1',
            bucket: 'teaket',
            forcePathStyle: true,
          },
        },
        ticket: {
          driver: 's3',
          config: {
            credentials: {
              accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
              secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            },
            endpoint: 'http://localhost:9000/',
            region: 'us-east-1',
            bucket: 'teaket',
            forcePathStyle: true,
          },
        },
      },
    },
  },
  settings: {
    tickets: {
      mails: {
        mailrest: {
          url: process.env.TK_SERVICE_MAILREST_API_URL || '',
          token: process.env.TK_SERVICE_MAILREST_API_TOKEN || '',
        },
      },
      ticket: {
        schema: {
          sequence: {
            prefix: 'TK',
            suffix: '',
            length: 6,
          },
        },
      },
    },
  },
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

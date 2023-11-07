import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TicketsModule } from '~/tickets/tickets.module'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import config, { MongoosePlugin } from './config'
import { RedisModule } from '@nestjs-modules/ioredis'
import { RedisOptions } from 'ioredis'
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core'
import { MongooseValidationFilter } from './_common/filters/mongoose-validation.filter'
import { DtoValidationPipe } from './_common/pipes/dto-validation.pipe'
import { CoreModule } from '~/core/core.module'
import { ShutdownService } from '~/shutdown.service'
import { AuthGuard } from '~/_common/guards/auth.guard'
import { AcceptLanguageResolver, CookieResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import { join } from 'path'
import { ExtensionsModule } from '~/extensions/extensions.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { FactorydriveModule, FactorydriveService } from '@streamkits/nestjs_module_factorydrive'
import { AwsS3Storage } from '@streamkits/nestjs_module_factorydrive-s3'
import { SettingsModule } from '~/core/settings/settings.module'
import { RequestContextModule } from 'nestjs-request-context'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    SettingsModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        for (const plugin of config.get<MongoosePlugin[]>('mongoose.plugins')) {
          import(plugin.package).then((plugin) => {
            mongoose.plugin(plugin.default ? plugin.default : plugin, plugin.options)
          })
        }
        return {
          ...config.get<MongooseModuleOptions>('mongoose.options'),
          uri: config.get<string>('mongoose.uri'),
        }
      },
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        config: {
          ...config.get<RedisOptions>('ioredis.options'),
          url: config.get<string>('ioredis.uri'),
        },
      }),
    }),
    FactorydriveModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ...config.get('factorydrive.options'),
      }),
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        fallbackLanguage: config.get<string>('i18n.fallbackLanguage', 'en'),
        typesOutputPath: join(__dirname, '../src/_generated/i18n.generated.ts'),
        loaderOptions: {
          path: join(__dirname, '/_i18n/'),
          watch: true,
        },
      }),
      resolvers: [{ use: QueryResolver, options: ['lang'] }, new CookieResolver(['lang']), new HeaderResolver(['x-lang']), AcceptLanguageResolver],
      logging: true,
    }),
    RequestContextModule,
    CoreModule.register(),
    TicketsModule.register(),
    ExtensionsModule.register(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ShutdownService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: MongooseValidationFilter,
    },
    {
      provide: APP_PIPE,
      useClass: DtoValidationPipe,
    },
  ],
})
export class AppModule {
  public constructor(storage: FactorydriveService) {
    storage.registerDriver('s3', AwsS3Storage)
  }
}

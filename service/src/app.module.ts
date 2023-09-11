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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        for (const plugin of config.get<MongoosePlugin[]>('mongoose.plugins')) {
          import(plugin.package).then((plugin) => {
            mongoose.plugin(
              plugin.default ? plugin.default : plugin,
              plugin.options,
            )
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
    CoreModule.register(),
    TicketsModule.register(),
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
}

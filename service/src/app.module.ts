import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TicketModule } from './ticket/ticket.module'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import config from './config'
import { RedisModule } from '@nestjs-modules/ioredis'
import { RedisOptions } from 'ioredis'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { MongooseValidationFilter } from './_common/filters/mongoose-validation.filter'
import { DtoValidationPipe } from './_common/pipes/dto-validation.pipe'

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
        mongoose.plugin(require('mongoose-unique-validator'), config.get<Record<string, any>>('mongoose.plugin.muv.options'))
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
    TicketModule.register(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
export class AppModule {}

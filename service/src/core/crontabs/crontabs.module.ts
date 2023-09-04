import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CrontabsSchema, Crontabs } from './schemas/crontabs.schema'
import { CrontabsService } from './crontabs.service'
import { CrontabsController } from './crontabs.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Crontabs.name,
        useFactory: () => CrontabsSchema,
      },
    ]),
  ],
  providers: [CrontabsService],
  controllers: [CrontabsController],
})
export class CrontabsModule {}

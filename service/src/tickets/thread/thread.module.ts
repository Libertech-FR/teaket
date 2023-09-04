import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ThreadSchema, Thread } from '~/tickets/thread/_schemas/thread.schema'
import { ThreadService } from './thread.service'
import { ThreadController } from './thread.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Thread.name,
        useFactory: () => ThreadSchema,
      },
    ]),
  ],
  providers: [ThreadService],
  controllers: [ThreadController],
})
export class ThreadModule {
}

import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ThreadSchema, Thread } from '~/tickets/thread/_schemas/thread.schema'
import { ThreadService } from './thread.service'
import { ThreadController } from './thread.controller'
import { TicketModule } from '~/tickets/ticket/ticket.module'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Thread.name,
        useFactory: () => ThreadSchema,
      },
    ]),
    forwardRef(() => TicketModule),
  ],
  providers: [ThreadService],
  controllers: [ThreadController],
  exports: [ThreadService],
})
export class ThreadModule {
}

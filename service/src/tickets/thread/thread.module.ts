import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ThreadSchema, Thread } from '~/tickets/thread/_schemas/thread.schema'
import { ThreadService } from './thread.service'
import { ThreadController } from './thread.controller'
import { TicketModule } from '~/tickets/ticket/ticket.module'
import { MailsModule } from '~/tickets/mails/mails.module'
import { FilestorageModule } from '~/core/filestorage/filestorage.module'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Thread.name,
        useFactory: () => ThreadSchema,
      },
    ]),
    forwardRef(() => TicketModule),
    forwardRef(() => MailsModule),
    FilestorageModule,
  ],

  providers: [ThreadService],
  controllers: [ThreadController],
  exports: [ThreadService],
})
export class ThreadModule {}

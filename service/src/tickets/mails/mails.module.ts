import { forwardRef, Module } from '@nestjs/common'
import { MailsController } from '~/tickets/mails/mails.controller'
import { MailsService } from '~/tickets/mails/mails.service'
import { TicketModule } from '~/tickets/ticket/ticket.module'
import { EntitiesModule } from '~/core/entities/entities.module'
import { FilestorageModule } from '~/core/filestorage/filestorage.module'
import { ThreadModule } from '~/tickets/thread/thread.module'

@Module({
  imports: [
    FilestorageModule,
    forwardRef(() => TicketModule),
    ThreadModule,
    EntitiesModule,
  ],
  providers: [MailsService],
  controllers: [MailsController],
})
export class MailsModule {
}

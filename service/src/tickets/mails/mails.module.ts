import { forwardRef, Module } from '@nestjs/common'
import { MailsController } from '~/tickets/mails/mails.controller'
import { MailsService } from '~/tickets/mails/mails.service'
import { TicketModule } from '~/tickets/ticket/ticket.module'
import { EntitiesModule } from '~/core/entities/entities.module'
import { FilestorageModule } from '~/core/filestorage/filestorage.module'
import { ThreadModule } from '~/tickets/thread/thread.module'
import { WebhooksService } from '~/tickets/mails/_services/webhooks.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule, FilestorageModule, forwardRef(() => TicketModule), forwardRef(() => ThreadModule), EntitiesModule],
  providers: [MailsService, WebhooksService],
  exports: [MailsService],
  controllers: [MailsController],
})
export class MailsModule {}

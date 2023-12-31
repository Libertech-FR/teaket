import { DynamicModule, Module } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { TicketsController } from './tickets.controller'
import { RouterModule } from '@nestjs/core'
import { SlaModule } from './sla/sla.module'
import { StateModule } from '~/tickets/state/state.module'
import { TicketModule } from '~/tickets/ticket/ticket.module'
import { SourceRequestModule } from '~/tickets/source-request/source-request.module'
import { ThreadModule } from './thread/thread.module'
import { MailsModule } from '~/tickets/mails/mails.module'
import { FormModule } from './form/form.module';

@Module({
  imports: [SlaModule, StateModule, TicketModule, SourceRequestModule, ThreadModule, MailsModule, FormModule],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {
  public static register(): DynamicModule {
    return {
      module: this,
      imports: [
        RouterModule.register([
          {
            path: 'tickets',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ]),
      ],
    }
  }
}

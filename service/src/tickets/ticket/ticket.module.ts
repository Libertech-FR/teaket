import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Ticket, TicketSchema } from './_schemas/ticket.schema'
import { TicketService } from './ticket.service'
import { TicketController } from './ticket.controller'
import { ThreadModule } from '~/tickets/thread/thread.module'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Ticket.name,
        useFactory: () => TicketSchema,
      },
    ]),
    forwardRef(() => ThreadModule),
  ],
  providers: [TicketService],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {
}

import { DynamicModule, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Ticket, TicketSchema } from './_schemas/ticket.schema'
import { TicketService } from './ticket.service'
import { TicketController } from './ticket.controller'
import { RouterModule } from '@nestjs/core'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Ticket.name,
        useFactory: () => TicketSchema,
      },
    ]),
  ],
  providers: [TicketService],
  controllers: [TicketController],
})
export class TicketModule {
}

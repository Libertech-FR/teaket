import { DynamicModule, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TicketSchema, Ticket } from './_schemas/ticket.schema'
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
  public static register(): DynamicModule {
    return {
      module: this,
      imports: [
        RouterModule.register([
          {
            path: 'ticket',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ]),
      ],
    }
  }
}

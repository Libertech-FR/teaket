import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Ticket } from './_schemas/ticket.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class TicketService extends AbstractServiceSchema {
  public constructor(@InjectModel(Ticket.name) protected _model: Model<Ticket>) {
    super()
  }
}

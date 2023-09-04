import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Ticket } from './_schemas/ticket.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable({ scope: Scope.REQUEST })
export class TicketService extends AbstractServiceSchema {
  public constructor(
    // protected readonly moduleRef: ModuleRef,
    @InjectModel(Ticket.name) protected _model: Model<Ticket>,
    @Inject(REQUEST) protected request?: Request & { user?: any },
  ) {
    super({ request })
  }
}

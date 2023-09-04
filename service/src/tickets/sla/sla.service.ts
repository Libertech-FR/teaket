import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Sla } from '~/tickets/sla/_schemas/sla.schema'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class SlaService extends AbstractServiceSchema {
  public constructor(@InjectModel(Sla.name) protected _model: Model<Sla>) {
    super()
  }
}

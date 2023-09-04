import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Sla } from './_schemas/sla.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class SlaService extends AbstractServiceSchema {
  constructor(@InjectModel(Sla.name) protected _model: Model<Sla>,
  ) {
    super()
  }
}

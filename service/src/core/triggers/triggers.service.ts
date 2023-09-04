import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Triggers } from './_schemas/triggers.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class TriggersService extends AbstractServiceSchema {
  constructor(@InjectModel(Triggers.name) protected _model: Model<Triggers>) {
    super()
  }
}

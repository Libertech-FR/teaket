import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Crontabs } from './_schemas/crontabs.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class CrontabsService extends AbstractServiceSchema {
  constructor(@InjectModel(Crontabs.name) protected _model: Model<Crontabs>) {
    super()
  }
}

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Identities } from '~/core/identities/_schemas/identities.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class IdentitiesService extends AbstractServiceSchema {
  constructor(@InjectModel(Identities.name) protected _model: Model<Identities>) {
    super()
  }
}

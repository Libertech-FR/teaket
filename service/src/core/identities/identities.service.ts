import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Identities } from './schemas/identities.schema'
import { Model } from 'mongoose'
import { AbstractService } from '~/_common/abstracts/abstract.service'

@Injectable()
export class IdentitiesService extends AbstractService {
  constructor(@InjectModel(Identities.name) protected model: Model<Identities>,
  ) {
    super()
  }
}

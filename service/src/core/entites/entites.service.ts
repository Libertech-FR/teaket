import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Entity } from '~/core/entites/_schemas/entites.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class EntitesService extends AbstractServiceSchema {
  public constructor(@InjectModel(Entity.name) protected _model: Model<Entity>) {
    super()
  }
}

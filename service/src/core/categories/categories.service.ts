import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Categories } from './_schemas/categories.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class CategoriesService extends AbstractServiceSchema {
  constructor(@InjectModel(Categories.name) protected _model: Model<Categories>) {
    super()
  }
}

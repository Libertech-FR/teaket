import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Filestorage } from './_schemas/filestorage.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class FilestorageService extends AbstractServiceSchema {
  constructor(@InjectModel(Filestorage.name) protected _model: Model<Filestorage>) {
    super()
  }
}

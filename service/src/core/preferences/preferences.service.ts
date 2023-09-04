import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Preferences } from './_schemas/preferences.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class PreferencesService extends AbstractServiceSchema {
  constructor(@InjectModel(Preferences.name) protected _model: Model<Preferences>) {
    super()
  }
}

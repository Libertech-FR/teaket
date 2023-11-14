import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Form } from './_schemas/form.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'

@Injectable()
export class FormService extends AbstractServiceSchema {
  constructor(@InjectModel(Form.name) protected _model: Model<Form>, protected readonly moduleRef: ModuleRef) {
    super({ moduleRef })
  }
}

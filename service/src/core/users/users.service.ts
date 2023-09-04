import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Users } from './schemas/users.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class UsersService extends AbstractServiceSchema {
  constructor(@InjectModel(Users.name) protected _model: Model<Users>,
  ) {
    super()
  }
}

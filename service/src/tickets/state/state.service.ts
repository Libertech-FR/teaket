import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { State } from '~/tickets/state/_schemas/state.schema'

@Injectable()
export class StateService extends AbstractServiceSchema {
  public constructor(@InjectModel(State.name) protected _model: Model<State>) {
    super()
  }
}

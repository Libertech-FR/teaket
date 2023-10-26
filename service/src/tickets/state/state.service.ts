import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { State } from '~/tickets/state/_schemas/state.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable(/*{ scope: Scope.REQUEST }*/)
export class StateService extends AbstractServiceSchema {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectModel(State.name) protected _model: Model<State>,
  ) // @Inject(REQUEST) protected req?: Request & { user?: Express.User },
  {
    super({ moduleRef /*, req*/ })
  }
}

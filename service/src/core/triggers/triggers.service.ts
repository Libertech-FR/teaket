import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Triggers } from './_schemas/triggers.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable({ scope: Scope.REQUEST })
export class TriggersService extends AbstractServiceSchema {
  constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectModel(Triggers.name) protected _model: Model<Triggers>,
    @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  ) {
    super({ moduleRef, request })
  }
}

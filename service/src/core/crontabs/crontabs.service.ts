import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Crontabs } from './_schemas/crontabs.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable(/*{ scope: Scope.REQUEST }*/)
export class CrontabsService extends AbstractServiceSchema {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectModel(Crontabs.name) protected _model: Model<Crontabs>,
  ) // @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  {
    super({ moduleRef /*, request*/ })
  }
}

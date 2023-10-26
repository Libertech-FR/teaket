import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Sla } from './_schemas/sla.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable(/*{ scope: Scope.REQUEST }*/)
export class SlaService extends AbstractServiceSchema {
  constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectModel(Sla.name) protected _model: Model<Sla>,
  ) // @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  {
    super({ moduleRef /*, request*/ })
  }
}

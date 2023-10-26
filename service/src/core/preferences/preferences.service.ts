import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Preferences } from './_schemas/preferences.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable(/*{ scope: Scope.REQUEST }*/)
export class PreferencesService extends AbstractServiceSchema {
  constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectModel(Preferences.name) protected _model: Model<Preferences>,
  ) // @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  {
    super({ moduleRef /*, request*/ })
  }
}

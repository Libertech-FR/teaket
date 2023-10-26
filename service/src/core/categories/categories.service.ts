import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Categories } from './_schemas/categories.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable(/*{ scope: Scope.REQUEST }*/)
export class CategoriesService extends AbstractServiceSchema {
  constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectModel(Categories.name) protected _model: Model<Categories>,
  ) // @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  {
    super({ moduleRef /*, request*/ })
  }
}

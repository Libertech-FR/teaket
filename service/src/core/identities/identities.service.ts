import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Identities } from '~/core/identities/_schemas/identities.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
// import { ModuleRef, REQUEST } from '@nestjs/core'
// import { Request } from 'express'

@Injectable({ /*scope: Scope.REQUEST*/ })
export class IdentitiesService extends AbstractServiceSchema {
  constructor(
    // protected readonly moduleRef: ModuleRef,
    @InjectModel(Identities.name) protected _model: Model<Identities>,
    // @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  ) {
    super({ /*moduleRef, request*/ })
  }
}

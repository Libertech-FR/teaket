import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SourceRequest } from '~/tickets/source-request/_schemas/source-request.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable({ scope: Scope.REQUEST })
export class SourceRequestService extends AbstractServiceSchema {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectModel(SourceRequest.name) protected _model: Model<SourceRequest>,
    @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  ) {
    super({ moduleRef, request })
  }
}

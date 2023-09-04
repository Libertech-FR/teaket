import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SourceRequest } from '~/tickets/source-request/_schemas/source-request.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class SourceRequestService extends AbstractServiceSchema {
  public constructor(@InjectModel(SourceRequest.name) protected _model: Model<SourceRequest>) {
    super()
  }
}

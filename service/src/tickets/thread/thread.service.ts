import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Thread } from '~/tickets/thread/_schemas/thread.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class ThreadService extends AbstractServiceSchema {
  public constructor(@InjectModel(Thread.name) protected _model: Model<Thread>,
  ) {
    super()
  }
}

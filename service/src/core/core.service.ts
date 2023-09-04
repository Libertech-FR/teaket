import { Injectable } from '@nestjs/common'
import { AbstractService } from '~/_common/abstracts/abstract.service'

@Injectable()
export class CoreService extends AbstractService {
  public constructor() {
    super()
  }
}

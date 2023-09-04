import { Controller } from '@nestjs/common'
import { CoreService } from './core.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'

@Controller('core')
export class CoreController extends AbstractController {
  public constructor(private readonly _service: CoreService) {
    super()
  }
}

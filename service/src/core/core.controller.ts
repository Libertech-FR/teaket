import { Controller } from '@nestjs/common'
import { CoreService } from './core.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('core')
@Controller('core')
export class CoreController extends AbstractController {
  public constructor(private readonly _service: CoreService) {
    super()
  }
}

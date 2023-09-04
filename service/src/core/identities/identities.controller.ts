import { Controller } from '@nestjs/common'
import { IdentitiesService } from './identities.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'

@Controller('identities')
export class IdentitiesController extends AbstractController {
  constructor(private readonly service: IdentitiesService) {
    super()
  }
}

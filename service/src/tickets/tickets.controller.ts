import { Controller } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'

@Controller('tickets')
export class TicketsController extends AbstractController {
  public constructor(private readonly _service: TicketsService) {
    super()
  }
}

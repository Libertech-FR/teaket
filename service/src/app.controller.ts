import { Controller, Get, Res } from '@nestjs/common'
import { AbstractController } from './_common/abstracts/abstract.controller'
import { AppService } from './app.service'
import { Response } from 'express'
import { Public } from './_common/decorators/public.decorator'

@Public()
@Controller()
export class AppController extends AbstractController {
  public constructor(private readonly _service: AppService) {
    super()
  }

  @Get()
  public root(@Res() res: Response): Response {
    return res.json(this._service.getInfos())
  }
}

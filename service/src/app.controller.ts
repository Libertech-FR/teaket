import { Controller, Get, Res } from '@nestjs/common'
import { AbstractController } from './_common/abstracts/abstract.controller'
import { AppService } from './app.service'
import { Response } from 'express'
import { Public } from './_common/decorators/public.decorator'
import { ShutdownService } from '~/shutdown.service'

@Public()
@Controller()
export class AppController extends AbstractController {
  public constructor(private readonly _service: AppService, private readonly _shutdown: ShutdownService) {
    super()
  }

  @Get()
  public root(@Res() res: Response): Response {
    return res.json(this._service.getInfos())
  }

  @Get('shutdown')
  public shutdown(@Res() res: Response): Response {
    this._shutdown.shutdown()
    return res.json({})
  }
}

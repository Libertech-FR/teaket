import { AbstractController } from '~/_common/abstracts/abstract.controller'
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus, Param,
  ParseFilePipe,
  Post, Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { MailsService } from '~/tickets/mails/mails.service'
import { Public } from '~/_common/decorators/public.decorator'
import { FileRawBodyInterceptor } from '~/_common/interceptors/file-raw-body.interceptor'
import { createHmac } from 'crypto'
import { MailsWebhookDto } from '~/tickets/mails/_dto/mails.dto'
import { WebhooksService } from '~/tickets/mails/_services/webhooks.service'
import { pick } from 'radash'

@Public()
@Controller('mails')
export class MailsController extends AbstractController {

  public constructor(
    private readonly _service: MailsService,
    protected readonly webhooks: WebhooksService,
  ) {
    super()
  }

  @Get()
  public async search(
    @Res() res: Response,
    @Query() queries: any,
  ): Promise<Response> {
    const data = await this._service.search(queries)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      ...data,
    })
  }

  @Get(':uid([\\w-.]+)')
  public async get(
    @Res() res: Response,
    @Param('uid') uid: string,
  ): Promise<Response> {
    const parsed = await this._service.get(uid)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        uid,
        ...pick(parsed, ['subject']),
        headers: parsed.headerLines.map((header) => ({
          key: header.key,
          value: header.line.split(':').slice(1).join(':').trim(),
        })),
      },
    })
  }

  @Get(':uid([\\w-.]+)/source')
  public async getSource(
    @Res() res: Response,
    @Param('uid') uid: string,
  ): Promise<void> {
    const parsed = await this._service.get(uid)
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Disposition', `inline; filename="${uid}.html"`)
    res.render('tickets/mails/eml', {
      data: {
        uid,
      },
      parsed,
    })
  }

  @Public()
  @Post('webhook')
  @UseInterceptors(FileRawBodyInterceptor('file'))
  public async webhook(
    @Res() res: Response,
    @Req() req: Request & { rawBody: string },
    @Body() body: MailsWebhookDto,
    @UploadedFile(
      new ParseFilePipe({ fileIsRequired: true }),
    ) file: Express.Multer.File,
    @Headers('X-Webhook-Signature') signatureChain?: string,
  ) {
    this.logger.log(`Webhook received: ${body.id} with signature ${signatureChain}`)
    const algo = signatureChain?.split('=')[0] || 'sha256'
    const signature = signatureChain?.split('=')[1] || ''
    const hmac = createHmac(algo, '123456')
    const digest = hmac.update(req.rawBody).digest('hex')
    if (signature !== digest) {
      this.logger.error(`Signature mismatch: ${signature} !== ${digest}`)
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      })
    }
    this.logger.log(`Signature verified: ${digest}`)
    const data = await this.webhooks.webhook(body, file)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}

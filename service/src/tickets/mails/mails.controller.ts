import { AbstractController } from '~/_common/abstracts/abstract.controller'
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
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
import { SearchMailsDto } from '~/tickets/mails/_dto/search-mails.dto'
import { Readable } from 'stream'

@Controller('mails')
export class MailsController extends AbstractController {
  public constructor(
    private readonly _service: MailsService,
    protected readonly webhooks: WebhooksService,
  ) {
    super()
  }

  @Get()
  public async search(@Res() res: Response, @Query() queries: SearchMailsDto): Promise<Response> {
    const [data, total] = await this._service.search(queries)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
      total,
    })
  }

  @Get(':account([\\w-.]+)/:seq([\\w-.]+)')
  public async get(@Res() res: Response, @Param('account') account: string, @Param('seq') seq: string): Promise<Response> {
    const [signature, parsed] = await this._service.get(account, seq)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        ...pick(parsed, ['subject']),
        headers: parsed.headerLines.map((header) => ({
          key: header.key,
          value: header.line.split(':').slice(1).join(':').trim(),
        })),
        signature,
      },
    })
  }

  @Public()
  @Get(':account([\\w-.]+)/:seq([\\w-.]+)/render')
  public async getRender(@Res() res: Response, @Param('account') account: string, @Param('seq') seq: string, @Query('signature') signature?: string): Promise<void> {
    const [fingerprint, parsed] = await this._service.get(account, seq)
    if (signature !== fingerprint) throw new UnauthorizedException('Invalid signature')
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Disposition', `inline; filename="${seq}.html"`)
    res.render('tickets/mails/eml', {
      parsed,
      attachments: parsed.attachments.map((attachment) => ({
        ...attachment,
        content: attachment.content.toString('base64'),
        fname: attachment.filename || attachment.checksum + '.bin',
      })),
    })
  }

  @Public()
  @Get(':account([\\w-.]+)/:seq([\\w-.]+)/source')
  public async getSource(@Res() res: Response, @Param('account') account: string, @Param('seq') seq: string, @Query('signature') signature?: string): Promise<Response> {
    const parsed = await this._service.getSource(account, seq)
    const fingerprint = await this._service.getSignature(parsed)
    if (signature !== fingerprint) throw new UnauthorizedException('Invalid signature')
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Disposition', `inline; filename="${seq}.eml"`)
    return res.send(parsed)
  }

  @Delete(':account([\\w-.]+)/:seq([\\w-.]+)')
  public async delete(@Res() res: Response, @Param('account') account: string, @Param('seq') seq: string): Promise<Response> {
    const data = await this._service.delete(account, seq)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Post('import')
  public async import(@Res() res: Response, @Body() body: MailsWebhookDto) {
    const source = await this._service.getSource(body.account, body.seq)
    const buffer = Buffer.from(source)
    const stream = Readable.from(buffer)
    // noinspection JSDeprecatedSymbols
    const data = await this.webhooks.webhook(body, {
      fieldname: 'file',
      originalname: `${body.seq}.eml`,
      encoding: '7bit',
      mimetype: 'message/rfc822',
      size: buffer.length,
      stream,
      destination: '.',
      filename: `${body.seq}.eml`,
      path: `${body.seq}.eml`,
      buffer,
    })
    await this._service.delete(body.account, body.seq)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Public()
  @Post('webhook')
  @UseInterceptors(FileRawBodyInterceptor('file'))
  public async webhook(
    @Res() res: Response,
    @Req() req: Request & { rawBody: string },
    @Body() body: MailsWebhookDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File,
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

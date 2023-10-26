import { AbstractService } from '~/_common/abstracts/abstract.service'
import { Injectable } from '@nestjs/common'
import { Response } from 'express'
import { Filestorage } from '~/core/filestorage/_schemas/filestorage.schema'
import { FsType } from '~/core/filestorage/_enum/fs-type.enum'
import { Readable } from 'stream'

@Injectable()
export class TransformersFilestorageService extends AbstractService {
  public static readonly TRANSFORMERS = {
    'text/plain': TransformersFilestorageService.transformPlain,
    'text/html': TransformersFilestorageService.transformHtml,
    'application/pdf': TransformersFilestorageService.transformPdf,
    'image/*': TransformersFilestorageService.transformImage,
    'message/rfc822': TransformersFilestorageService.transformEml,
  }

  public static readonly EMBED_TRANSFORMERS = {
    'message/rfc822': TransformersFilestorageService.transformEmbedEml,
  }

  public constructor() {
    super()
  }

  public async transform(mime: string, res: Response, data: Filestorage, stream: NodeJS.ReadableStream, parent?: Filestorage): Promise<void> {
    if (data.type === FsType.EMBED && parent) {
      const parentMimeType = mime || parent.mime || 'application/octet-stream'
      if (!TransformersFilestorageService.EMBED_TRANSFORMERS.hasOwnProperty(parentMimeType)) {
        throw new Error(`No transformer for mime type ${parentMimeType}`)
      }
      return TransformersFilestorageService.EMBED_TRANSFORMERS[parentMimeType](mime, res, data, stream)
    }
    const mimeType = mime || data.mime || 'application/octet-stream'
    const hasTransformer = TransformersFilestorageService.TRANSFORMERS.hasOwnProperty(mimeType)
    // TransformersFilestorageService.TRANSFORMERS.hasOwnProperty(mimeType) || TransformersFilestorageService.TRANSFORMERS.hasOwnProperty(mimeType.split('/')[0] + '/*')
    if (!hasTransformer) {
      if (TransformersFilestorageService.TRANSFORMERS.hasOwnProperty(mimeType.split('/')[0] + '/*')) {
        await TransformersFilestorageService.TRANSFORMERS[mimeType.split('/')[0] + '/*'](mime, res, data, stream)
        return
      }
    }
    if (!hasTransformer) {
      res.setHeader('Content-Type', mimeType)
      // eslint-disable-next-line
      res.setHeader('Content-Disposition', `attachment; filename="${(data as any).filename}"`)
      stream.pipe(res)
      return
    }
    await TransformersFilestorageService.TRANSFORMERS[mimeType](mime, res, data, stream)
  }

  public static async transformPlain(_: string, res: Response, data: Filestorage, stream: NodeJS.ReadableStream): Promise<void> {
    res.setHeader('Content-Type', 'text/plain')
    // eslint-disable-next-line
    res.setHeader('Content-Disposition', `inline; filename="${(data as any).filename}"`)
    stream.pipe(res)
    return
  }

  public static async transformPdf(_: string, res: Response, data: Filestorage, stream: NodeJS.ReadableStream): Promise<void> {
    res.setHeader('Content-Type', 'application/pdf')
    // eslint-disable-next-line
    res.setHeader('Content-Disposition', `inline; filename="${(data as any).filename}"`)
    stream.pipe(res)
    return
  }

  public static async transformHtml(_: string, res: Response, data: Filestorage, stream: NodeJS.ReadableStream): Promise<void> {
    res.setHeader('Content-Type', 'text/html')
    // eslint-disable-next-line
    res.setHeader('Content-Disposition', `inline; filename="${(data as any).filename}"`)
    stream.pipe(res)
    return
  }

  public static async transformImage(mime: string, res: Response, data: Filestorage, stream: NodeJS.ReadableStream): Promise<void> {
    res.setHeader('Content-Type', 'image/' + mime.split('/').pop())
    // eslint-disable-next-line
    res.setHeader('Content-Disposition', `inline; filename="${(data as any).filename}"`)
    stream.pipe(res)
    return
  }

  protected static async transformEml(_: string, res: Response, data: Filestorage, stream: NodeJS.ReadableStream): Promise<void> {
    res.setHeader('Content-Type', 'text/html')
    // eslint-disable-next-line
    res.setHeader('Content-Disposition', `inline; filename="${(data as any).filename}.html"`)
    const { simpleParser } = await import('mailparser')
    const parsed = await simpleParser(stream)
    res.render('core/filestorage/transformers/eml', {
      data,
      parsed,
    })
  }

  public static async transformEmbedEml(mime: string, res: Response, data: Filestorage, stream: NodeJS.ReadableStream): Promise<void> {
    const embedId = data.path.split('#').pop()
    const { simpleParser } = await import('mailparser')
    const parsed = await simpleParser(stream)
    const embed = parsed.attachments.find((attachment) => {
      if (attachment.filename === embedId) return true
      if (attachment.cid === embedId) return true
      return attachment.checksum === embedId.replace(/\.checksum$/, '')
    })
    if (!embed) throw new Error(`No embed found for ${embedId}`)
    const streamEmbed = Readable.from(embed.content)
    const mimeType = mime || data.mime || 'application/octet-stream'
    const hasTransformer = TransformersFilestorageService.TRANSFORMERS.hasOwnProperty(mimeType)
    if (!hasTransformer) {
      if (TransformersFilestorageService.TRANSFORMERS.hasOwnProperty(mimeType.split('/')[0] + '/*')) {
        await TransformersFilestorageService.TRANSFORMERS[mimeType.split('/')[0] + '/*'](mimeType, res, data, streamEmbed)
        return
      }
    }
    if (!hasTransformer && !TransformersFilestorageService.TRANSFORMERS.hasOwnProperty(mimeType.split('/')[0] + '/*')) {
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `attachment; filename="${embedId}"`)
      streamEmbed.pipe(res)
      return
    }

    await TransformersFilestorageService.TRANSFORMERS[mimeType](mimeType, res, data, streamEmbed)
  }
}

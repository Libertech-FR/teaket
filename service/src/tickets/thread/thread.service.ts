import { ConflictException, forwardRef, Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Thread } from '~/tickets/thread/_schemas/thread.schema'
import { Document, FilterQuery, Model, ProjectionType, Query, QueryOptions, SaveOptions, Types } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { TicketService } from '~/tickets/ticket/ticket.service'
import { ThreadCreateDto } from '~/tickets/thread/_dto/thread.dto'
import { I18nService } from 'nestjs-i18n'
// import { I18nTranslations } from '~/_generated/i18n.generated'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { WrapperType } from '~/_common/types/wrapper.type'
import { ThreadType, ThreadTypeLabel } from '~/tickets/thread/_enum/thread-type.enum'
import { MailsService } from '~/tickets/mails/mails.service'
import { FilestorageService } from '~/core/filestorage/filestorage.service'
import { FragmentType } from '~/tickets/thread/_enum/fragment-type.enum'
import { FragmentPartDto } from '~/tickets/thread/_dto/parts/fragment.part.dto'
import { FsType } from '~/core/filestorage/_enum/fs-type.enum'
import { Readable } from 'stream'
import { Filestorage } from '~/core/filestorage/_schemas/filestorage.schema'

@Injectable({ scope: Scope.REQUEST })
export class ThreadService extends AbstractServiceSchema {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    @Inject(REQUEST) protected readonly request: Request,
    @InjectModel(Thread.name) protected _model: Model<Thread>,
    @Inject(forwardRef(() => TicketService))
    protected ticketService: WrapperType<TicketService>,
    protected mailsService: MailsService,
    protected filestorageService: FilestorageService,
    private readonly i18n: I18nService,
    // private readonly i18n: I18nService<I18nTranslations>,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super({ moduleRef, request, eventEmitter })
  }

  /* eslint-disable */
  public async findAndCount<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<[Array<T & Query<T, T, any, T>>, number]> {
    if (!filter.ticketId) throw new ConflictException('Search must be contain filter by ticketId')
    //TODO: check acl
    return await super.findAndCount(
      {
        ...filter,
        ticketId: new Types.ObjectId(filter.ticketId),
      },
      projection,
      options,
    )
  }

  public async create<T extends AbstractSchema | Document>(
    data?: ThreadCreateDto,
    options?: SaveOptions & {
      checkTicketId?: boolean
    },
  ): Promise<Document<T, any, T>> {
    if (options?.checkTicketId !== false) {
      const count = await this.ticketService.count({ _id: data.ticketId })
      if (!count) throw new ConflictException(this.i18n.t(`thread.service.create.ticketNotFound`))
    }
    data.ticketId = new Types.ObjectId(data.ticketId)
    data.fragments.map((fragment) => {
      fragment.id = new Types.ObjectId()
      return fragment
    })

    let created: Document<T, any, T>
    await this._model.db.transaction(async (session) => {
      let threadData = { ...data }
      switch (data.type) {
        case ThreadType.OUTGOING: {
          threadData.fragments = await Promise.all(
            threadData.fragments.map(async (fragment): Promise<FragmentPartDto> => {
              if (fragment.disposition === FragmentType.RAW) {
                const fragId = fragment.id || new Types.ObjectId()
                const path = ['ticket', data.ticketId, ThreadTypeLabel[ThreadType.OUTGOING].toLowerCase(), `${fragId}.html`].join('/')
                const buffer = Buffer.from(fragment.message, 'utf-8')
                // noinspection JSDeprecatedSymbols
                const storedFile = (await this.filestorageService.create<Filestorage>(
                  {
                    namespace: 'ticket',
                    type: FsType.FILE,
                    path,
                    file: {
                      fieldname: 'file',
                      encoding: '7bit',
                      size: buffer.length,
                      filename: `${fragId}.html`,
                      originalname: `${fragId}.html`,
                      buffer: buffer,
                      mimetype: 'text/html',
                      destination: '.',
                      path,
                      stream: Readable.from(buffer),
                    },
                    customFields: {
                      ticketId: data.threadId,
                    },
                  },
                  { session },
                )) as Filestorage
                return {
                  id: fragId,
                  disposition: FragmentType.FILE,
                  filestorage: {
                    id: storedFile._id,
                    name: storedFile.path.split('/').pop(),
                    path: storedFile.path,
                    mime: storedFile.mime,
                    namespace: storedFile.namespace,
                  },
                }
              }
              return fragment
            }),
          )
          break
        }
      }
      created = await super.create(threadData, {
        ...options,
        validateBeforeSave: false,
        session,
      })
      switch (data.type) {
        case ThreadType.OUTGOING: {
          const files = []
          for (const attachment of data.attachments || []) {
            const [_, fileStream] = await this.filestorageService.findByIdWithRawData(attachment.id)
            files.push(fileStream)
          }
          const html = []
          for (const fragment of data.fragments) {
            switch (fragment.disposition) {
              case FragmentType.RAW: {
                html.push(fragment.message)
                break
              }
              case FragmentType.FILE: {
                let data = ''
                const [_, fileStream] = await this.filestorageService.findByIdWithRawData(fragment.filestorage?.id)
                fileStream.on('data', (chunk) => (data += chunk))
                await new Promise((resolve) => fileStream.on('end', resolve))
                html.push(data)
              }
            }
          }

          //TODO: replyTo à gerer
          const mailed = await this.mailsService.submit(
            data.mailinfo?.account,
            {
              to: data.mailinfo?.to?.map((to) => to.address),
              cc: data.mailinfo?.cc?.map((cc) => cc.address),
              subject: data.mailinfo?.subject,
              html: html.join('<br>'),
            },
            files,
          )
          await session.commitTransaction()
          created = (await super.update(created._id, {
            $set: {
              'mailinfo.messageId': mailed.messageId,
              'mailinfo.from': {
                address: mailed?.envelope?.from,
              },
            },
          })) as unknown as Document<T, any, T>
          break
        }
      }
    })

    return created
  }

  public async delete<T extends AbstractSchema | Document>(_id: Types.ObjectId | any, options?: QueryOptions<T> | null | undefined): Promise<Query<T, T, any, T>> {
    //TODO: check acl
    return await super.delete(_id, options)
  }
  /* eslint-enable */
}

import { AbstractService } from '~/_common/abstracts/abstract.service'
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { ParsedMail, simpleParser } from 'mailparser'
import { TicketService } from '~/tickets/ticket/ticket.service'
import { TicketCreateDto } from '~/tickets/ticket/_dto/ticket.dto'
import { EntitiesService } from '~/core/entities/entities.service'
import { ThreadService } from '~/tickets/thread/thread.service'
import { ThreadCreateDto } from '~/tickets/thread/_dto/thread.dto'
import { ThreadType, ThreadTypeLabel } from '~/tickets/thread/_enum/thread-type.enum'
import { Ticket } from '~/tickets/ticket/_schemas/ticket.schema'
import { FilestorageService } from '~/core/filestorage/filestorage.service'
import { FsType } from '~/core/filestorage/_enum/fs-type.enum'
import { FragmentPartDto } from '~/tickets/thread/_dto/parts/fragment.part.dto'
import { FragmentType } from '~/tickets/thread/_enum/fragment-type.enum'
import { Filestorage } from '~/core/filestorage/_schemas/filestorage.schema'
import { ClientSession, Types } from 'mongoose'
import { IdfsPartDto } from '~/_common/dto/parts/idfs.part.dto'
import { TicketType } from '~/tickets/ticket/_enum/ticket-type.enum'
import { TicketLifestep } from '~/tickets/ticket/_enum/ticket-lifestep.enum'
import { MailsWebhookDto } from '~/tickets/mails/_dto/mails.dto'
import { isArray, pick } from 'radash'
import { MailaddressPartDto } from '~/_common/dto/parts/mailaddress.part.dto'

@Injectable()
export class MailsService extends AbstractService {
  public constructor(
    protected readonly filestorage: FilestorageService,
    protected readonly entities: EntitiesService,
    @Inject(forwardRef(() => TicketService))
    protected readonly ticket: TicketService,
    protected readonly thread: ThreadService,
  ) {
    super()
  }

  public async webhook(body: MailsWebhookDto, file: Express.Multer.File) {
    const parsed = await simpleParser(file.buffer)
    this.logger.log(`New email parsed ${parsed.messageId}`)
    this.logger.debug(`More details: ${JSON.stringify({
      from: parsed.from.text,
      subject: parsed.subject,
    }, null, 2)}`)
    if (parsed.inReplyTo) {
      this.logger.log(`Email detected as reply to ${parsed.inReplyTo}`)
      const checkEmail = await this.filestorage.model.findOne({
        'customFields.email.messageId': parsed.inReplyTo,
      }) as Filestorage
      if (checkEmail) {
        const checkTicket = await this.ticket.model.findById(checkEmail?.customFields?.ticketId)
        console.log('checkTicket', checkTicket)
        this.logger.log(`Email already processed ${parsed.messageId}`)
        return
      }
      console.log('checkEmail', checkEmail)
      return
    }
    const checkEmail = await this.filestorage.model.findOne({
      'customFields.email.messageId': parsed.messageId,
    }) as Filestorage
    if (checkEmail) {
      const checkTicket = await this.ticket.model.findById(checkEmail?.customFields?.ticketId)
      console.log('checkTicket', checkTicket)
      this.logger.log(`Email already processed ${parsed.messageId}`)
      return
    }
    this.logger.log(`New ticket processing...`)
    await this.ticket.model.db.transaction(async (session) => {
      const [ticket, storedFile] = await this.triggerWebhookTicket(session, { body, parsed, file })
      await this.triggerWebhookThread(session, { body, ticket, storedFile, parsed, file })
    }).catch((e) => {
      this.logger.error(e.message, e.stack)
      throw new BadRequestException(e.message, { cause: e })
    })
  }

  protected async triggerWebhookTicket(session: ClientSession, context: {
    body: MailsWebhookDto,
    parsed: ParsedMail,
    file: Express.Multer.File,
  }): Promise<[Ticket, Filestorage]> {
    const ticket = (await this.ticket.create(<TicketCreateDto>{
      subject: context.parsed.subject,
      type: TicketType.REQUEST,
      lifestep: TicketLifestep.OPEN,
      envelope: {
        senders: await Promise.all(context.parsed.from.value.map(async (sender) => {
          const entity = await this.entities.findOrCreateFromEmail(sender)
          return {
            name: entity.profile.commonName,
            type: entity.type,
            id: entity._id,
          }
        })),
        observers: [],
        assigned: [],
      },
      tags: [],
      sla: {
        dueAt: new Date(),
        manual: true,
      },
      impact: {
        id: new Types.ObjectId('60a0a0a0a0a0a0a0a0a0a0a0'),
        name: 'Aucun',
      },
      priority: {
        id: new Types.ObjectId('60a0a0a0a0a0a0a0a0a0a0a0'),
        name: 'Aucun',
      },
      metadata: {
        createdBy: context.parsed.from.text,
        createdAt: context.parsed.date,
        lastUpdatedBy: context.parsed.from.text,
        lastUpdatedAt: context.parsed.date,
      },
    }, { session })) as Ticket
    this.logger.log(`New ticket created ${ticket._id}`)
    const storedFile = await this.saveWebhookFile(session, {
      body: context.body,
      ticket,
      parsed: context.parsed,
      file: context.file,
    })
    return [
      ticket,
      storedFile,
    ]
  }

  protected async saveWebhookFile(session: ClientSession, context: {
    body: MailsWebhookDto,
    ticket: Ticket,
    parsed: ParsedMail,
    file: Express.Multer.File,
  }): Promise<Filestorage> {
    const path = [
      'ticket',
      context.ticket._id,
      ThreadTypeLabel[ThreadType.INCOMING].toLowerCase(),
      `${context.body.id}.eml`,
    ].join('/')
    const storedFile = await this.filestorage.create({
      namespace: 'ticket',
      type: FsType.FILE,
      path,
      file: context.file,
      customFields: {
        ticketId: context.ticket._id,
        email: {
          messageId: context.parsed.messageId,
          headers: context.parsed.headers,
        },
      },
    }, { session })
    this.logger.log(`New email stored ${storedFile._id}`)
    return storedFile as Filestorage
  }

  protected async triggerWebhookThread(session: ClientSession, context: {
    body: MailsWebhookDto,
    ticket: Ticket,
    storedFile: Filestorage,
    parsed: ParsedMail,
    file: Express.Multer.File,
  }) {
    const entityFrom = await this.entities.findOrCreateFromEmail(context.parsed.from.value[0])
    const from = {
      ...pick(context.parsed.from.value[0], ['address', 'name']),
      entityId: entityFrom._id,
    } as MailaddressPartDto
    const to = await Promise.all(Object.values(isArray(context.parsed.to) ? context.parsed.to : [context.parsed.to])
      .map(async (to) => {
        const entityTo = await this.entities.findOrCreateFromEmail(to.value[0])
        return {
          ...pick(to.value[0], ['address', 'name']),
          entityId: entityTo._id,
        } as MailaddressPartDto
      }))
    const thread = await this.thread.create(<ThreadCreateDto>{
      ticketId: context.ticket._id,
      type: ThreadType.INCOMING,
      fragments: [
        <FragmentPartDto>{
          id: new Types.ObjectId(),
          disposition: FragmentType.FILE,
          filestorage: <IdfsPartDto>{
            id: context.storedFile._id,
            name: (context.storedFile as any).filename,
            namespace: context.storedFile.namespace,
            path: context.storedFile.path,
          },
        },
      ],
      attachments: await Promise.all(context.parsed.attachments.map(async (attachment) => {
        const attachmentPath = `${context.storedFile.path}#${attachment.filename || attachment.cid || attachment.checksum + '.checksum'}`
        const filestorageAttachment = (await this.filestorage.create({
          namespace: 'ticket',
          type: FsType.EMBED,
          path: attachmentPath,
          linkedTo: context.storedFile._id,
          mime: attachment.contentType,
          customFields: {
            ticketId: context.ticket._id,
            emailHeaders: attachment.headers,
          },
        }, { session, checkFilestorageLinkedTo: false })) as Filestorage
        this.logger.log(`New attachment stored ${filestorageAttachment._id} for thread`)
        return <IdfsPartDto>{
          id: filestorageAttachment._id,
          name: attachment.filename || attachment.cid || attachment.checksum,
          namespace: 'ticket',
          path: attachmentPath,
        }
      })),
      mailinfo: {
        subject: context.parsed.subject,
        from,
        to,
        messageId: context.parsed.messageId,
        filestorage: <IdfsPartDto>{
          id: context.storedFile._id,
          name: (context.storedFile as any).filename,
          namespace: context.storedFile.namespace,
          path: context.storedFile.path,
        },
      },
      metadata: {
        createdBy: context.parsed.from.text,
        createdAt: context.parsed.date,
        lastUpdatedBy: context.parsed.from.text,
        lastUpdatedAt: context.parsed.date,
      },
    }, { session, checkTicketId: false })
    this.logger.log(`New thread created ${thread._id} to ticket ${context.ticket._id}`)
  }
}

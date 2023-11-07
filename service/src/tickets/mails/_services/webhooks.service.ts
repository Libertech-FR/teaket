import { FilestorageService } from '~/core/filestorage/filestorage.service'
import { EntitiesService } from '~/core/entities/entities.service'
import { BadRequestException, ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { TicketService } from '~/tickets/ticket/ticket.service'
import { ThreadService } from '~/tickets/thread/thread.service'
import { MailsWebhookDto } from '~/tickets/mails/_dto/mails.dto'
import { ParsedMail, simpleParser } from 'mailparser'
import { Thread } from '~/tickets/thread/_schemas/thread.schema'
import { ClientSession, Types } from 'mongoose'
import { Ticket } from '~/tickets/ticket/_schemas/ticket.schema'
import { Filestorage } from '~/core/filestorage/_schemas/filestorage.schema'
import { isArray, pick } from 'radash'
import { TicketCreateDto } from '~/tickets/ticket/_dto/ticket.dto'
import { TicketType } from '~/tickets/ticket/_enum/ticket-type.enum'
import { TicketLifestep } from '~/tickets/ticket/_enum/ticket-lifestep.enum'
import { ThreadType, ThreadTypeLabel } from '~/tickets/thread/_enum/thread-type.enum'
import { FsType } from '~/core/filestorage/_enum/fs-type.enum'
import { MailaddressPartDto } from '~/_common/dto/parts/mailaddress.part.dto'
import { ThreadCreateDto } from '~/tickets/thread/_dto/thread.dto'
import { FragmentPartDto } from '~/tickets/thread/_dto/parts/fragment.part.dto'
import { FragmentType } from '~/tickets/thread/_enum/fragment-type.enum'
import { IdfsPartDto } from '~/_common/dto/parts/idfs.part.dto'
import { AbstractService } from '~/_common/abstracts/abstract.service'

@Injectable()
export class WebhooksService extends AbstractService {
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
    this.logger.debug(
      `More details: ${JSON.stringify(
        {
          from: parsed.from.text,
          subject: parsed.subject,
        },
        null,
        2,
      )}`,
    )
    const checkEmail = (await this.thread.model.findOne({
      'mailinfo.account': body.account,
      'mailinfo.messageId': parsed.messageId,
    })) as Thread
    if (checkEmail) {
      this.logger.warn(`Email already processed ${parsed.messageId} in ticket ${checkEmail.ticketId} and thread ${checkEmail._id}`)
      throw new ConflictException(`Email already processed ${parsed.messageId} in ticket ${checkEmail.ticketId} and thread ${checkEmail._id}`)
    }
    if (parsed.inReplyTo) {
      this.logger.log(`Existing ticket processing...`)
      await this.ticket.model.db
        .transaction(async (session) => {
          const [existTicket, existStoredFile] = await this.triggerInReplyTo(session, { body, parsed, file })
          await this.triggerWebhookThread(session, { body, ticket: existTicket, storedFile: existStoredFile, parsed, file })
        })
        .catch((e) => {
          this.logger.error(e.message, e.stack)
          throw new BadRequestException(e.message, { cause: e })
        })
      return
    }
    this.logger.log(`New ticket processing...`)
    await this.ticket.model.db
      .transaction(async (session) => {
        const [ticket, storedFile] = await this.triggerWebhookTicket(session, { body, parsed, file })
        await this.triggerWebhookThread(session, { body, ticket, storedFile, parsed, file })
      })
      .catch((e) => {
        this.logger.error(e.message, e.stack)
        throw new BadRequestException(e.message, { cause: e })
      })
  }

  protected async triggerInReplyTo(
    session: ClientSession,
    context: {
      body: MailsWebhookDto
      parsed: ParsedMail
      file: Express.Multer.File
    },
  ): Promise<[Ticket, Filestorage]> {
    this.logger.log(`Email detected as reply to ${context.parsed.inReplyTo}`)
    const checkReplyEmail = (await this.thread.model.findOne({
      'mailinfo.messageId': context.parsed.inReplyTo,
    })) as Thread
    if (!checkReplyEmail) {
      this.logger.warn(`Email considered as reply to ${context.parsed.inReplyTo} but no original thread found`)
      //TODO: check with from email contains +sequence and integrate if ticket exists
      const repliedTo = Object.values(isArray(context.parsed.to) ? context.parsed.to : [context.parsed.to])
        .map((to) => to.value[0].address)
        .find((address) => address.includes('+'))
      if (repliedTo) {
        const repliedToId = repliedTo.split('@').shift().split('+').pop()
        this.logger.log(`Email detected as reply to ${context.parsed.inReplyTo} with sequence ${repliedToId}`)
        const existTicketBySequence = (await this.ticket.model.findOne({ sequence: repliedToId })) as Ticket
        if (existTicketBySequence) {
          const existStoredFile = (await this.filestorage.model.findOne({
            _id: checkReplyEmail.mailinfo.filestorage.id,
          })) as Filestorage
          if (!existStoredFile) {
            throw new BadRequestException(`Email considered as reply to ${context.parsed.inReplyTo} but no original filestorage found`)
          }
          return [existTicketBySequence, existStoredFile]
        }
        this.logger.warn(`Email considered as reply to ${context.parsed.inReplyTo} but no original ticket found`)
      }
      throw new BadRequestException(`Email considered as reply to ${context.parsed.inReplyTo} but no original thread found`)
    }
    const existTicket = (await this.ticket.model.findOneAndUpdate(
      {
        _id: checkReplyEmail.ticketId,
      },
      {
        $set: {
          lifeStep: TicketLifestep.OPEN,
        },
      },
      {
        upsert: false,
        new: true,
      },
    )) as Ticket
    console.log('checkReplyEmail', checkReplyEmail)
    // const existStoredFile = (await this.filestorage.model.findOne({
    //   _id: checkReplyEmail.mailinfo.filestorage.id,
    // })) as Filestorage
    if (!existTicket) {
      throw new BadRequestException(`Email considered as reply to ${context.parsed.inReplyTo} but no original ticket found`)
    }
    // if (!existStoredFile) {
    //   throw new BadRequestException(`Email considered as reply to ${context.parsed.inReplyTo} but no original filestorage found`)
    // }
    const path = ['ticket', existTicket._id, ThreadTypeLabel[ThreadType.INCOMING].toLowerCase(), `${context.body.id}.eml`].join('/')
    const existStoredFile = (await this.filestorage.create(
      {
        namespace: 'ticket',
        type: FsType.FILE,
        path,
        file: context.file,
        customFields: {
          ticketId: existTicket._id,
          email: {
            messageId: context.parsed.messageId,
            headers: context.parsed.headers,
          },
        },
      },
      { session },
    )) as Filestorage
    return [existTicket, existStoredFile]
  }

  protected async triggerWebhookTicket(
    session: ClientSession,
    context: {
      body: MailsWebhookDto
      parsed: ParsedMail
      file: Express.Multer.File
    },
  ): Promise<[Ticket, Filestorage]> {
    const ticket = (await this.ticket.create(
      <TicketCreateDto>{
        subject: context.parsed.subject,
        type: TicketType.REQUEST,
        lifestep: TicketLifestep.OPEN,
        envelope: {
          senders: await Promise.all(
            context.parsed.from.value.map(async (sender) => {
              const entity = await this.entities.findOrCreateFromEmail(sender)
              return {
                name: entity.profile.commonName,
                type: entity.type,
                id: entity._id,
              }
            }),
          ),
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
      },
      { session },
    )) as Ticket
    this.logger.log(`New ticket created ${ticket._id}`)
    const storedFile = await this.saveWebhookFile(session, {
      body: context.body,
      ticket,
      parsed: context.parsed,
      file: context.file,
    })
    return [ticket, storedFile]
  }

  protected async saveWebhookFile(
    session: ClientSession,
    context: {
      body: MailsWebhookDto
      ticket: Ticket
      parsed: ParsedMail
      file: Express.Multer.File
    },
  ): Promise<Filestorage> {
    const path = ['ticket', context.ticket._id, ThreadTypeLabel[ThreadType.INCOMING].toLowerCase(), `${context.body.id}.eml`].join('/')
    const storedFile = await this.filestorage.create(
      {
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
      },
      { session },
    )
    this.logger.log(`New email stored ${storedFile._id}`)
    return storedFile as Filestorage
  }

  protected async triggerWebhookThread(
    session: ClientSession,
    context: {
      body: MailsWebhookDto
      ticket: Ticket
      storedFile: Filestorage
      parsed: ParsedMail
      file: Express.Multer.File
    },
  ) {
    const entityFrom = await this.entities.findOrCreateFromEmail(context.parsed.from.value[0])
    const from = {
      ...pick(context.parsed.from.value[0], ['address', 'name']),
      entityId: entityFrom._id,
    } as MailaddressPartDto
    const to = await Promise.all(
      Object.values(isArray(context.parsed.to) ? context.parsed.to : [context.parsed.to]).map(async (to) => {
        const entityTo = await this.entities.findOrCreateFromEmail(to.value[0])
        return {
          ...pick(to.value[0], ['address', 'name']),
          entityId: entityTo._id,
        } as MailaddressPartDto
      }),
    )
    const parsedCc = isArray(context.parsed.cc) ? context.parsed.cc : context.parsed.cc ? [context.parsed.cc] : []
    const cc = await Promise.all(
      Object.values(parsedCc).map(async (cc) => {
        console.log('cc', cc)
        const entityCc = await this.entities.findOrCreateFromEmail(cc.value[0])
        return {
          ...pick(cc.value[0], ['address', 'name']),
          entityId: entityCc._id,
        } as MailaddressPartDto
      }),
    )
    const newThreadId = new Types.ObjectId()
    const thread = await this.thread.create(
      <ThreadCreateDto>{
        _id: newThreadId,
        ticketId: context.ticket._id,
        type: ThreadType.INCOMING,
        fragments: [
          <FragmentPartDto>{
            id: new Types.ObjectId(),
            disposition: FragmentType.FILE,
            filestorage: <IdfsPartDto>{
              id: context.storedFile._id,
              // eslint-disable-next-line
              name: (context.storedFile as any).filename,
              namespace: context.storedFile.namespace,
              path: context.storedFile.path,
            },
          },
        ],
        attachments: await Promise.all(
          context.parsed.attachments.map(async (attachment) => {
            const attachmentPath = `${context.storedFile.path}#${attachment.filename || attachment.cid || attachment.checksum + '.checksum'}`
            const filestorageAttachment = (await this.filestorage.create(
              {
                namespace: 'ticket',
                type: FsType.EMBED,
                path: attachmentPath,
                linkedTo: context.storedFile._id,
                mime: attachment.contentType,
                customFields: {
                  threadId: newThreadId,
                  ticketId: context.ticket._id,
                  emailHeaders: attachment.headers,
                },
              },
              { session, checkFilestorageLinkedTo: false },
            )) as Filestorage
            this.logger.log(`New attachment stored ${filestorageAttachment._id} for thread`)
            return <IdfsPartDto>{
              id: filestorageAttachment._id,
              name: attachment.filename || attachment.cid || attachment.checksum,
              namespace: 'ticket',
              path: attachmentPath,
            }
          }),
        ),
        mailinfo: {
          account: context.body.account,
          subject: context.parsed.subject,
          from,
          to,
          cc,
          messageId: context.parsed.messageId,
          filestorage: <IdfsPartDto>{
            id: context.storedFile._id,
            // eslint-disable-next-line
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
      },
      { session, checkTicketId: false },
    )
    this.logger.log(`New thread created ${thread._id} to ticket ${context.ticket._id}`)
  }
}

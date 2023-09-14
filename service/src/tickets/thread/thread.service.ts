import { ConflictException, forwardRef, Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Thread } from '~/tickets/thread/_schemas/thread.schema'
import { Document, FilterQuery, Model, ProjectionType, Query, QueryOptions, SaveOptions, Types } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { TicketService } from '~/tickets/ticket/ticket.service'
import { ThreadCreateDto } from '~/tickets/thread/_dto/thread.dto'
import { I18nService } from 'nestjs-i18n'
import { I18nTranslations } from '~/_generated/i18n.generated'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable({ scope: Scope.REQUEST })
export class ThreadService extends AbstractServiceSchema {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    @Inject(REQUEST) protected readonly request: Request,
    @InjectModel(Thread.name) protected _model: Model<Thread>,
    @Inject(forwardRef(() => TicketService))
    protected ticketService: TicketService,
    private readonly i18n: I18nService<I18nTranslations>,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super({ moduleRef, request, eventEmitter })
  }

  public async findAndCount<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<[Query<Array<T>, T, any, T>[], number]> {
    if (!filter.ticketId) throw new ConflictException('Search must be contain filter by ticketId')
    //TODO: check acl
    return await super.findAndCount({
      ...filter,
      ticketId: new Types.ObjectId(filter.ticketId),
    }, projection, options)
  }

  public async create<T extends AbstractSchema | Document>(data?: ThreadCreateDto, options?: SaveOptions): Promise<Document<T, any, T>> {
    const count = await this.ticketService.count({ _id: data.ticketId })
    if (!count) throw new ConflictException(this.i18n.t(`thread.service.create.ticketNotFound`))
    return await super.create(data, options)
  }

  public async delete<T extends AbstractSchema | Document>(
    _id: Types.ObjectId | any,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Query<T, T, any, T>> {
    //TODO: check acl
    return await super.delete(_id, options)
  }
}

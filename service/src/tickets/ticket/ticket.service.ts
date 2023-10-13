import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Ticket } from './_schemas/ticket.schema'
import { Document, Model, ModifyResult, Query, QueryOptions, SaveOptions, Types, UpdateQuery } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'
import { ThreadService } from '~/tickets/thread/thread.service'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { FragmentType } from '~/tickets/thread/_enum/fragment-type.enum'
import { ThreadType } from '~/tickets/thread/_enum/thread-type.enum'
import { I18nService } from 'nestjs-i18n'
import { isEqual, reduce } from 'radash'
import { SettingsService } from '~/core/settings/settings.service'
import { TicketLifestep } from './_enum/ticket-lifestep.enum'
import { WrapperType } from '~/_common/types/wrapper.type'
import { I18nTranslations } from '~/_generated/i18n.generated'

@Injectable({ scope: Scope.REQUEST })
export class TicketService extends AbstractServiceSchema {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    @Inject(forwardRef(() => ThreadService))
    protected readonly threadService: WrapperType<ThreadService>,
    protected readonly settings: SettingsService,
    // private readonly i18n: I18nService,
    private readonly i18n: I18nService<I18nTranslations>,
    @InjectModel(Ticket.name) protected _model: Model<Ticket>,
    @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  ) {
    super({ moduleRef, request })
  }

  public async closeMany<T extends AbstractSchema | Document>(ids: Types.ObjectId[]): Promise<UpdateQuery<Query<T, T, any, T>>> {
    this.logger.log(`closeMany: ${ids}`)
    return this._model.updateMany({ _id: { $in: ids } }, { $set: { lifestep: TicketLifestep.CLOSED } })
  }

  /* eslint-disable */
  public async create<T extends AbstractSchema | Document>(data?: any, options?: SaveOptions): Promise<Document<T, any, T>> {
    // noinspection UnnecessaryLocalVariableJS
    const created = await super.create<T>(data, options)
    // await this.threadService.create({
    //   ticketId: created._id,
    // })
    return created
  }

  public async update<T extends AbstractSchema | Document>(
    _id: Types.ObjectId | any,
    update: UpdateQuery<T>,
    options?: QueryOptions<T> & { rawResult: true },
  ): Promise<ModifyResult<Query<T, T, any, T>>> {
    let updated: ModifyResult<Query<T, T, any, T>>
    const beforeData = await this.findById<T>(_id)
    await this._model.db.transaction(async (session) => {
      updated = await super.update<T>(_id, update, { ...options, session })
      const diff = await reduce(Object.keys(update), async (acc, key) => (isEqual(update[key], beforeData[key]) ? acc : acc.concat(key)), [])
      if (diff.length) {
        const message = this.i18n.t(`ticket.service.update.newFragment`, {
          args: {
            fields: diff.map((field) => this.i18n.t(`ticket.schema.${field}` as any)).join(', '),
          },
        })
        const fragment = {
          id: new Types.ObjectId(),
          disposition: FragmentType.RAW,
          message,
        }
        await this.threadService.create({
          ticketId: _id,
          type: ThreadType.SYSTEM,
          fragments: [fragment],
        })
      }
    })
    return updated
  }
  /* eslint-enable */
}

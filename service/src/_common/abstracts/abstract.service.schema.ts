import { Injectable, NotFoundException } from '@nestjs/common'
import { AbstractSchema } from './schemas/abstract.schema'
import { Document, FilterQuery, Model, ModifyResult, ProjectionType, Query, QueryOptions, SaveOptions, Types, UpdateQuery } from 'mongoose'
import { AbstractService, AbstractServiceContext } from './abstract.service'
import { ServiceSchemaInterface } from './interfaces/service.schema.interface'
import { EventEmitterSeparator } from '~/_common/constants/event-emitter.constant'

@Injectable()
export abstract class AbstractServiceSchema extends AbstractService implements ServiceSchemaInterface {
  protected abstract _model: Model<AbstractSchema | Document>

  protected constructor(context?: AbstractServiceContext) {
    super(context)
  }

  public get model(): Model<AbstractSchema | Document> {
    return this._model
  }

  /* eslint-disable */
  public async find<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Query<Array<T>, T, any, T>[]> {
    //TODO: add event emitter
    this.logger.debug(['find', JSON.stringify(Object.values(arguments))].join(' '))
    return await this._model.find<Query<Array<T>, T, any, T>>(filter, projection, options).exec()
  }

  public async count<T extends AbstractSchema | Document>(filter?: FilterQuery<T>, options?: QueryOptions<T>): Promise<number> {
    //TODO: add event emitter
    this.logger.debug(['count', JSON.stringify(Object.values(arguments))].join(' '))
    return await this._model.countDocuments(filter, options).exec()
  }

  public async findAndCount<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<[Array<T & Query<T, T, any, T>>, number]> {
    this.logger.debug(['findAndCount', JSON.stringify(Object.values(arguments))].join(' '))
    if (this.eventEmitter) {
      const beforeEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'beforeFindAndCount'].join(EventEmitterSeparator),
        { filter, projection, options },
      )
      // noinspection DuplicatedCode
      for (const beforeEvent of beforeEvents) {
        if (beforeEvent?.stop) throw beforeEvent?.stop
        if (beforeEvent?.filter) filter = { ...filter, ...beforeEvent.filter }
        if (beforeEvent?.projection) projection = { ...(typeof projection === 'object' ? projection : {}), ...beforeEvent.projection }
        if (beforeEvent?.options) options = { ...options, ...beforeEvent.options }
      }
    }
    let count = await this._model.countDocuments(filter).exec()
    let total = await this._model.find<T & Query<T, T, any, T>>(filter, projection, options).exec()
    if (this.eventEmitter) {
      const afterEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'afterFindAndCount'].join(EventEmitterSeparator),
        { total, count },
      )
      for (const afterEvent of afterEvents) {
        if (afterEvent?.total) total = { ...total, ...afterEvent.total }
        if (afterEvent?.count) count += afterEvent.count
      }
    }
    return [total, count]
  }

  public async findById<T extends AbstractSchema | Document>(
    _id: Types.ObjectId | any,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Query<T, T, any, T>> {
    this.logger.debug(['findById', JSON.stringify(Object.values(arguments))].join(' '))
    if (this.eventEmitter) {
      const beforeEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'beforeFindById'].join(EventEmitterSeparator),
        { _id, projection, options },
      )
      for (const beforeEvent of beforeEvents) {
        if (beforeEvent?.stop) throw beforeEvent?.stop
        if (beforeEvent?.projection) projection = { ...(typeof projection === 'object' ? projection : {}), ...beforeEvent.projection }
        if (beforeEvent?.options) options = { ...options, ...beforeEvent.options }
      }
    }
    let data = await this._model.findById<Query<T | null, T, any, T>>(_id, projection, options).exec()
    if (this.eventEmitter) {
      const afterEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'afterFindById'].join(EventEmitterSeparator),
        { data },
      )
      for (const afterEvent of afterEvents) {
        if (afterEvent?.data) data = { ...data, ...afterEvent.data }
      }
    }
    if (!data) throw new NotFoundException()
    return data
  }

  public async findOne<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Query<T, T, any, T>> {
    this.logger.debug(['findOne', JSON.stringify(Object.values(arguments))].join(' '))
    if (this.eventEmitter) {
      const beforeEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'beforeFindOne'].join(EventEmitterSeparator),
        { filter, projection, options },
      )
      for (const beforeEvent of beforeEvents) {
        if (beforeEvent?.stop) throw beforeEvent?.stop
        if (beforeEvent?.filter) filter = { ...filter, ...beforeEvent.filter }
        if (beforeEvent?.projection) projection = { ...(typeof projection === 'object' ? projection : {}), ...beforeEvent.projection }
        if (beforeEvent?.options) options = { ...options, ...beforeEvent.options }
      }
    }
    let data = await this._model.findOne<Query<T | null, T, any, T>>(filter, projection, options).exec()
    if (!data) throw new NotFoundException()
    if (this.eventEmitter) {
      const afterEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'afterFindOne'].join(EventEmitterSeparator),
        { data },
      )
      for (const afterEvent of afterEvents) {
        if (afterEvent?.data) data = { ...data, ...afterEvent.data }
      }
    }
    return data
  }

  public async create<T extends AbstractSchema | Document>(data?: any, options?: SaveOptions): Promise<Document<T, any, T>> {
    const logInfos = Object.values({
      ...arguments,
      1: {
        ...arguments[1],
        session: typeof arguments[1] === 'object' && 'session' in arguments[1] ? 'session' : undefined,
      },
    })
    this.logger.debug(['create', JSON.stringify(logInfos)].join(' '))
    if (this.eventEmitter) {
      const beforeEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'beforeCreate'].join(EventEmitterSeparator),
        { data, options },
      )
      for (const beforeEvent of beforeEvents) {
        if (beforeEvent?.stop) throw beforeEvent?.stop
        if (beforeEvent?.data) data = { ...data, ...beforeEvent.data }
        if (beforeEvent?.options) options = { ...options, ...beforeEvent.options }
      }
    }
    const document: Document<T, any, T> = new this._model({
      metadata: {
        createdBy: this.request?.user?.username || 'anonymous',
        createdAt: new Date(),
        lastUpdatedBy: this.request?.user?.username || 'anonymous',
        lastUpdatedAt: new Date(),
      },
      ...data,
    })
    let created = document.save(options)
    if (this.eventEmitter) {
      const afterEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'afterFindAndCount'].join(EventEmitterSeparator),
        { created },
      )
      for (const afterEvent of afterEvents) {
        if (afterEvent?.created) created = { ...created, ...afterEvent.created }
      }
    }
    return created
  }

  public async update<T extends AbstractSchema | Document>(
    _id: Types.ObjectId | any,
    update: UpdateQuery<T>,
    options?: QueryOptions<T> & { rawResult: true },
  ): Promise<ModifyResult<Query<T, T, any, T>>> {
    const logInfos = Object.values({
      ...arguments,
      2: {
        ...arguments[2],
        session: typeof arguments[2] === 'object' && 'session' in arguments[2] ? 'session' : undefined,
      },
    })
    this.logger.debug(['update', JSON.stringify(logInfos)].join(' '))
    if (this.eventEmitter) {
      const beforeEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'beforeUpdate'].join(EventEmitterSeparator),
        { _id, update, options },
      )
      for (const beforeEvent of beforeEvents) {
        if (beforeEvent?.stop) throw beforeEvent?.stop
        if (beforeEvent?.data) update = { ...update, ...beforeEvent.update }
        if (beforeEvent?.options) options = { ...options, ...beforeEvent.options }
      }
    }
    let updated = await this._model
      .findByIdAndUpdate<Query<T | null, T, any, T>>(
        { _id },
        {
          ...update,
          $set: {
            ...(update?.$set || {}),
            'metadata.lastUpdatedBy': this.request?.user?.username || 'anonymous',
            'metadata.lastUpdatedAt': new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
          ...options,
        },
      )
      .exec()
    if (!updated) throw new NotFoundException()
    if (this.eventEmitter) {
      const afterEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'afterFindAndCount'].join(EventEmitterSeparator),
        { updated },
      )
      for (const afterEvent of afterEvents) {
        if (afterEvent?.updated) updated = { ...updated, ...afterEvent.updated }
      }
    }
    return updated
  }

  public async delete<T extends AbstractSchema | Document>(_id: Types.ObjectId | any, options?: QueryOptions<T> | null | undefined): Promise<Query<T, T, any, T>> {
    this.logger.debug(['delete', JSON.stringify(Object.values(arguments))].join(' '))
    if (this.eventEmitter) {
      const beforeEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'beforeDelete'].join(EventEmitterSeparator),
        { _id, options },
      )
      for (const beforeEvent of beforeEvents) {
        if (beforeEvent?.stop) throw beforeEvent?.stop
        if (beforeEvent?.options) options = { ...options, ...beforeEvent.options }
      }
    }
    let deleted = await this._model.findByIdAndDelete<Query<T | null, T, any, T>>({ _id }, options).exec()
    if (!deleted) throw new NotFoundException()
    if (this.eventEmitter) {
      const afterEvents = await this.eventEmitter?.emitAsync(
        [this.moduleName.toLowerCase(), this.serviceName.toLowerCase(), 'service', 'afterFindAndCount'].join(EventEmitterSeparator),
        { deleted },
      )
      for (const afterEvent of afterEvents) {
        if (afterEvent?.deleted) deleted = { ...deleted, ...afterEvent.deleted }
      }
    }
    return deleted
  }

  /* eslint-enable */
}

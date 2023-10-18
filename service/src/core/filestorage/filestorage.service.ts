// noinspection ExceptionCaughtLocallyJS

import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Filestorage } from './_schemas/filestorage.schema'
import {
  Document,
  FilterQuery,
  Model,
  ModifyResult,
  ProjectionType,
  Query,
  QueryOptions,
  SaveOptions,
  Types,
  UpdateQuery,
} from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { FactorydriveService } from '@streamkits/nestjs_module_factorydrive'
import { FilestorageCreateDto } from '~/core/filestorage/_dto/filestorage.dto'
import { FsType } from '~/core/filestorage/_enum/fs-type.enum'
import { omit } from 'radash'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

export const EMBED_SEPARATOR = '#'

function hasFileExtension(path: string): boolean {
  const regex = /\.\w+$/
  return regex.test(path)
}

@Injectable({ scope: Scope.REQUEST })
export class FilestorageService extends AbstractServiceSchema {
  protected readonly reservedChars = ['\\', '?', '%', '*', ':', '|', '"', '<', '>', '#']

  public constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectModel(Filestorage.name) protected _model: Model<Filestorage>,
    protected readonly storage: FactorydriveService,
    @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  ) {
    super({ moduleRef, request })
  }

  /* eslint-disable */
  public async create<T extends AbstractSchema | Document>(
    data?: FilestorageCreateDto & { file?: Express.Multer.File },
    options?: SaveOptions & { checkFilestorageLinkedTo?: boolean },
  ): Promise<Document<T, any, T>> {
    const file = data.file
    if (file && data.type !== FsType.FILE) throw new BadRequestException(`Type must be ${FsType.FILE}`)
    try {
      let payload: FilestorageCreateDto = { ...omit(data, ['file']) }
      const basePath = this.reservedChars.reduce((acc, char) => {
        if (char === EMBED_SEPARATOR && data.type === FsType.EMBED) return acc
        return acc.replace(char, '_')
      }, payload.path.replace(/^\//, '').replace(/\.\.\//g, ''))
      const partPath = ['', basePath]
      // noinspection ExceptionCaughtLocallyJS
      switch (data.type) {
        case FsType.FILE: {
          if (!basePath || !hasFileExtension(basePath)) {
            partPath.push(file.originalname)
          }
          payload.mime = data.mime || file.mimetype
          await this.storage.getDisk(data.namespace).put(partPath.join('/'), file.buffer)
          break
        }
        case FsType.EMBED: {
          const embedBasePath = [...partPath].pop().split(EMBED_SEPARATOR)
          const embedId = embedBasePath.pop()
          if (!embedId || !hasFileExtension(embedId)) throw new BadRequestException(`Embed anchor must have a file extension`)
          if (options.checkFilestorageLinkedTo !== false) {
            const existFile = await this._model.findById(payload.linkedTo)
            if (!existFile) throw new BadRequestException(`File ${payload.linkedTo} not found`)
            payload.linkedTo = existFile._id
          }
          break
        }
      }
      payload.path = partPath.join('/')
      return super.create(payload, options)
    } catch (e) {
      if (e.code === 'E_INVALID_CONFIG') {
        throw new BadRequestException(`Namespace ${data.namespace} not found`)
      }
      throw e
    }
  }

  public async findById<T extends AbstractSchema | Document>(
    _id: Types.ObjectId | any,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Query<T, T, any, T>> {
    const data = await super.findById<Document<any, any, Filestorage> & Filestorage>(_id, projection, options)
    if (data.type === FsType.FILE) {
      const storageRequest = await this.storage.getDisk(data.namespace).exists(data.path)
      if (!storageRequest.exists) this.logger.warn(`Filestorage ${data._id} not found in storage`)
      return {
        ...data.toObject(),
        _exists: storageRequest.exists,
      }
    }
    return data.toObject()
  }

  public async findByIdWithRawData<T extends Filestorage | Document>(
    _id: Types.ObjectId | any,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<[Document<any, any, Filestorage> & Filestorage, NodeJS.ReadableStream | null, (Document<any, any, Filestorage> & Filestorage) | null]> {
    const data = await super.findById<Document<any, any, Filestorage> & Filestorage>(_id, projection, options)
    if (data.type === FsType.FILE) {
      const stream = await this.storage.getDisk(data.namespace).getStream(data.path)
      return [
        data,
        stream,
        null,
      ]
    } else if (data.type === FsType.EMBED) {
      return this.findRawDataWithEmbed(data, projection, options)
    }
    return [data, null, null]
  }

  public async findOneWithRawData<T extends Filestorage | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<[Document<any, any, Filestorage> & Filestorage, NodeJS.ReadableStream | null, (Document<any, any, Filestorage> & Filestorage) | null]> {
    const data = await super.findOne<Document<any, any, Filestorage> & Filestorage>(filter, projection, options)
    if (data.type === FsType.FILE) {
      const stream = await this.storage.getDisk(data.namespace).getStream(data.path)
      return [
        data,
        stream,
        null,
      ]
    } else if (data.type === FsType.EMBED) {
      return this.findRawDataWithEmbed(data, projection, options)
    }
    return [data, null, null]
  }

  public async findOne<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Query<T, T, any, T>> {
    const data = await super.findOne<Document<any, any, Filestorage> & Filestorage>(filter, projection, options)
    if (data.type === FsType.FILE) {
      const storageRequest = await this.storage.getDisk(data.namespace).exists(data.path)
      if (!storageRequest.exists) this.logger.warn(`Filestorage ${data._id} not found in storage`)
      return {
        ...data.toObject(),
        _exists: storageRequest.exists,
      }
    }
    return data.toObject()
  }

  public async update<T extends AbstractSchema | Document>(
    _id: Types.ObjectId | any,
    update: UpdateQuery<T>,
    options?: QueryOptions<T> & { rawResult: true },
  ): Promise<ModifyResult<Query<T, T, any, T>>> {
    let updated: ModifyResult<Query<T, T, any, T>>
    const data = await super.findById<Document<any, any, Filestorage> & Filestorage>(_id)
    if (!data) throw new BadRequestException(`Filestorage ${_id} not found`)
    await this._model.db.transaction(async (session) => {
      updated = await super.update(_id, update, { ...options, session })
      try {
        await this.storage.getDisk(data.namespace).move(data.path, update.path)
      } catch (e) {
        if (e.code === 'E_UNKNOWN') {
          const err = new BadRequestException(`Impossible de déplacer le fichier ${data.path} vers ${update.path}`)
          err.stack = e.stack
          throw err
        }
        throw e
      }
    })
    return updated
  }

  public async findRawDataWithEmbed<T extends AbstractSchema | Document>(
    embedFilestorage: Filestorage,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<[Document<any, any, Filestorage> & Filestorage, NodeJS.ReadableStream, (Document<any, any, Filestorage> & Filestorage) | null]> {
    const data = await this.findById<Document<any, any, Filestorage> & Filestorage>(embedFilestorage.linkedTo, projection, options)
    if (!data) throw new BadRequestException(`Filestorage ${embedFilestorage.linkedTo} not found`)
    const stream = await this.storage.getDisk(data.namespace).getStream(data.path)
    return [
      embedFilestorage,
      stream,
      data,
    ]
  }

  /* eslint-enable */
}

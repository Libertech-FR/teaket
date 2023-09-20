import { BadRequestException, Injectable } from '@nestjs/common'
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

function hasFileExtension(path: string): boolean {
  const regex = /\.\w+$/
  return regex.test(path)
}

@Injectable()
export class FilestorageService extends AbstractServiceSchema {
  constructor(
    @InjectModel(Filestorage.name) protected _model: Model<Filestorage>,
    // @InjectS3() private readonly s3: S3,
    protected readonly storage: FactorydriveService,
  ) {
    super()
  }

  public async create<T extends AbstractSchema | Document>(
    data?: FilestorageCreateDto & { file?: Express.Multer.File },
    options?: SaveOptions,
  ): Promise<Document<T, any, T>> {
    const file = data.file
    delete data.file
    if (file && data.type !== FsType.FILE) throw new BadRequestException(`Type must be ${FsType.FILE}`)
    try {
      let payload: FilestorageCreateDto = { ...data }
      const partPath = ['']
      const customFileName = data.path.replace(/^\//, '')
      if (customFileName) partPath.push(customFileName)
      if (data.type === FsType.FILE) {
        //TODO: ignore ../
        if (!customFileName || !hasFileExtension(customFileName)) {
          partPath.push(file.originalname)
        }
        payload.mime = file.mimetype
        await this.storage.getDisk(data.namespace).put(partPath.join('/'), file.buffer)
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
    const storageRequest = await this.storage.getDisk(data.namespace).exists(data.path)
    if (!storageRequest.exists) this.logger.warn(`Filestorage ${data._id} not found in storage`)
    return {
      ...data.toObject(),
      _exists: storageRequest.exists,
    }
  }

  public async findByIdWithRawData<T extends Filestorage | Document>(
    _id: Types.ObjectId | any,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<[Document<any, any, Filestorage> & Filestorage, NodeJS.ReadableStream]> {
    const data = await super.findById<Document<any, any, Filestorage> & Filestorage>(_id, projection, options)
    const stream = await this.storage.getDisk(data.namespace).getStream(data.path)
    return [
      data,
      stream,
    ]
  }

  public async findOne<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Query<T, T, any, T>> {
    const data = await super.findOne<Document<any, any, Filestorage> & Filestorage>(filter, projection, options)
    const storageRequest = await this.storage.getDisk(data.namespace).exists(data.path)
    if (!storageRequest.exists) this.logger.warn(`Filestorage ${data._id} not found in storage`)
    return {
      ...data.toObject(),
      _exists: storageRequest.exists,
    }
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
}

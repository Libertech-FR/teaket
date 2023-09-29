import {
  Document,
  FilterQuery,
  ModifyResult,
  ProjectionType,
  Query,
  QueryOptions,
  SaveOptions,
  Types,
  UpdateQuery,
} from 'mongoose'
import { AbstractSchema } from '../schemas/abstract.schema'

export interface ServiceSchemaInterface {
  /* eslint-disable */
  find<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Query<Array<T>, T, any, T>[]>

  count<T extends AbstractSchema | Document>(filter?: FilterQuery<T>, options?: QueryOptions<T> | null | undefined): Promise<number>

  findAndCount<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<[Query<Array<T>, T, any, T>[], number]>

  findById<T extends AbstractSchema | Document>(id: Types.ObjectId | any, projection?: ProjectionType<T> | null | undefined, options?: QueryOptions<T> | null | undefined): Promise<Query<T, T, any, T>>

  findOne<T extends AbstractSchema | Document>(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<Query<T, T, any, T>>

  create<T extends AbstractSchema | Document>(data?: any, options?: SaveOptions): Promise<Document<T, any, T>>

  update<T extends AbstractSchema | Document>(
    _id: Types.ObjectId | any,
    update: UpdateQuery<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<ModifyResult<Query<T, T, any, T>>>

  delete<T extends AbstractSchema | Document>(_id: Types.ObjectId | any, options?: QueryOptions<T> | null | undefined): Promise<Query<T, T, any, T>>
  /* eslint-enable */
}

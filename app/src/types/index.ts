import { Types } from 'mongoose'

export * from './tickets'

export * from './threads'

export * from './filter'

export * from './mails'

export * from './forms'

export type MixedValue =
  | string
  | Types.ObjectId
  | Date
  | number
  | boolean
  | null
  | object
  | Array<MixedValue>
  | {
    [key: string | number]: MixedValue
  }

export interface Metadata {
  createdBy: string
  createdAt: string
  lastUpdatedBy: string
  lastUpdatedAt: string
}

import { Types } from 'mongoose'

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

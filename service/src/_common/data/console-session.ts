import { IdentityType } from '~/_common/types/identity.type'
import { Types } from 'mongoose'

export class ConsoleSession {
  public readonly _id: string = '000000000000000000000000'
  public readonly username: string = 'console'
  public readonly entityId: Types.ObjectId = new Types.ObjectId('000000000000000000000000')
  public readonly displayName: string = 'Console'
  public constructor() {
  }
}

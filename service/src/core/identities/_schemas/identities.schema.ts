import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { StatePart, StatePartSchema } from '~/core/identities/_schemas/parts/state.part.schema'
import { SecurityPart, SecurityPartSchema } from '~/core/identities/_schemas/parts/security.part.schema'
import { Types } from 'mongoose'

const DEFAULT_THIRD_PARTY_AUTH = 'local'

@Schema({
  collection: 'identities',
  versionKey: false,
})
export class Identities extends AbstractSchema {
  @Prop({
    type: Types.ObjectId,
    required: true,
    unique: true,
  })
  public entityId: Types.ObjectId

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  public username: string

  @Prop({
    type: String,
  })
  public displayName: string

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  public email: string

  @Prop({
    type: String,
    required: true,
  })
  public password: string

  @Prop({
    type: String,
    default: DEFAULT_THIRD_PARTY_AUTH,
  })
  public thirdPartyAuth: string

  @Prop({
    type: StatePartSchema,
    required: true,
  })
  public state: StatePart

  @Prop({
    type: String,
    default: '/',
  })
  public baseURL: string

  @Prop({
    type: [String],
  })
  public roles: string[]

  @Prop({
    type: SecurityPartSchema,
  })
  public security: SecurityPart

  @Prop({
    type: Boolean,
    default: false,
  })
  public hidden: boolean

  @Prop({
    type: Object,
  })
  public customFields?: { [key: string]: any }
}

export const IdentitiesSchema = SchemaFactory.createForClass(Identities).pre('save', function (this: Identities, next: () => void): void {
  if (this.isNew) {
    this.displayName = this.displayName || this.username
  }
  next()
})

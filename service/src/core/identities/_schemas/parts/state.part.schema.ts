import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { IdentityState, IdentityStateList } from '~/core/identities/_enum/identity-state.enum'

@Schema({ _id: false })
export class StatePart extends Document {
  @Prop({
    required: true,
    type: Number,
    enum: IdentityStateList,
    default: IdentityState.PENDING,
  })
  public current: number

  @Prop({
    type: Date,
    default: new Date(),
  })
  public lastChangedAt?: Date

  @Prop({ type: Date })
  public suspendedUntil?: Date

  @Prop({ type: String })
  public suspendedReason?: string
}

export const StatePartSchema = SchemaFactory.createForClass(StatePart)

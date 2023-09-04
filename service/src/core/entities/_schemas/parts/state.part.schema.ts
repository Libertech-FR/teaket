import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { EntityState, EntityStateList } from '~/core/entities/_enum/entity-state.enum'

@Schema({ _id: false })
export class StatePart extends Document {
  @Prop({
    required: true,
    type: Number,
    enum: EntityStateList,
    default: EntityState.ACTIVE,
  })
  public current: number

  @Prop({
    type: Date,
    default: new Date(),
  })
  public lastChangedAt?: Date
}

export const StatePartSchema = SchemaFactory.createForClass(StatePart)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { EntityState, EntityStateList } from '~/core/entities/_enum/entity-state.enum'
import { ProfilePart } from '~/core/entities/_schemas/parts/profile.part.schema'

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
StatePartSchema.virtual('isActive').get(function (this: StatePart): boolean {
  return this.current > EntityState.INACTIVE
})

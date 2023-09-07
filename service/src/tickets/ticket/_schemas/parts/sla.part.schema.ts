import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ _id: false })
export class SlaPart extends Document {
  @Prop({
    type: Types.ObjectId,
  })
  public id?: Types.ObjectId

  @Prop({
    type: String,
  })
  public name?: string

  @Prop({
    type: Date,
    default: new Date(),
  })
  public dueAt: Date

  @Prop({
    type: Boolean,
    default: false,
  })
  public manual: boolean
}

export const SlaPartSchema = SchemaFactory.createForClass(SlaPart)
  .pre('validate', function (this: SlaPart) {
    if (!this.manual && !this.id) {
      throw new Error('If sla is not manual, id must be provided')
    }
  })

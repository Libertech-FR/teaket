import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ _id: false })
export class TagPart extends Document {
  @Prop({
    type: Types.ObjectId,
  })
  public id?: Types.ObjectId

  @Prop({
    type: String,
    required: true,
  })
  public name: string

  @Prop({
    type: Boolean,
    default: false,
  })
  public manual: boolean
}

export const TagPartSchema = SchemaFactory.createForClass(TagPart).pre('validate', function (this: TagPart) {
  if (!this.manual && !this.id) {
    throw new Error('If tag is not manual, id must be provided')
  }
})

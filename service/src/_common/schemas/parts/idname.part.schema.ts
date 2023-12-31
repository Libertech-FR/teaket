import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { SourceRequest } from '~/tickets/source-request/_schemas/source-request.schema'

@Schema({ _id: false })
export class IdnamePart extends Document {
  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  public id: Types.ObjectId

  @Prop({
    type: String,
    required: true,
  })
  public name: string
}

export const IdnamePartSchema = SchemaFactory.createForClass(IdnamePart)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { SourceRequest } from '~/tickets/source-request/_schemas/source-request.schema'

@Schema({ _id: false })
export class MailaddressPart extends Document {
  @Prop({
    type: String,
    required: true,
  })
  public address: string

  @Prop({
    type: String,
  })
  public name?: string

  @Prop({
    type: Types.ObjectId,
  })
  public entityId?: Types.ObjectId
}

export const MailaddressPartSchema = SchemaFactory.createForClass(MailaddressPart)

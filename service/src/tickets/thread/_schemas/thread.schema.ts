import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { Types } from 'mongoose'
import { IdnamePart, IdnamePartSchema } from '~/_common/schemas/parts/idname.part.schema'
import { FragmentPart, FragmentPartSchema } from '~/tickets/thread/_schemas/parts/fragment.part.schema'

@Schema({
  collection: 'threads',
  versionKey: false,
})
export class Thread extends AbstractSchema {
  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  public ticketId: Types.ObjectId

  @Prop({
    type: IdnamePartSchema,
    required: true,
  })
  public sourceRequest: IdnamePart

  @Prop({
    required: true,
    type: String,
  })
  public message: string

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  public timeSpend: number

  @Prop({
    type: [FragmentPartSchema],
    default: [],
  })
  public fragments: FragmentPart[]

  @Prop({
    type: Object,
  })
  public customFields: object
}

export const ThreadSchema = SchemaFactory.createForClass(Thread)

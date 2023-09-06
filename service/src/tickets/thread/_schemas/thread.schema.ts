import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { Types } from 'mongoose'
import { IdnamePart, IdnamePartSchema } from '~/_common/schemas/parts/idname.part.schema'
import { FragmentPart, FragmentPartSchema } from '~/tickets/thread/_schemas/parts/fragment.part.schema'
import { IdfsPart, IdfsPartSchema } from '~/_common/schemas/parts/idfs.part.schema'

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
    type: Number,
    default: 0,
  })
  public timeSpend: number

  @Prop({
    type: [FragmentPartSchema],
    default: [],
  })
  public fragments: FragmentPart[]

  @Prop({
    type: [IdfsPartSchema],
    default: [],
  })
  public attachments: IdfsPart[]

  @Prop({
    type: Object,
  })
  public customFields?: { [key: string]: any }
}

export const ThreadSchema = SchemaFactory.createForClass(Thread)
  .pre('validate', function (next) {
    if (this.fragments.length === 0) {
      next(new Error('Un fragment est obligatoire'))
    }
    next()
  })

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, ObjectId, Types } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

export type PreferencesDocument = Preferences & Document

@Schema({
  collection: 'preferences',
  versionKey: false,
})
export class Preferences extends AbstractSchema {
  @Prop({
    required: true,
    type: String,
  })
  public name: string

  @Prop({
    required: true,
    type: Object,
  })
  public data: { [key: string]: any }

  @Prop({
    required: true,
    type: Types.ObjectId,
  })
  public personId: ObjectId
}

export const PreferencesSchema = SchemaFactory.createForClass(Preferences)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ObjectId, Types } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({
  collection: 'preferences',
  versionKey: false,
})
export class Preferences extends AbstractSchema {
  @Prop({
    required: true,
    type: String,
    //TODO: check if pattern is correct
  })
  public name: string

  @Prop({ type: Types.ObjectId })
  public entityId?: ObjectId

  @Prop({
    type: Object,
    default: {},
  })
  public data: { [key: string]: any }
}

export const PreferencesSchema = SchemaFactory.createForClass(Preferences)
  .index({ name: 1, entityId: 1 }, { unique: true })

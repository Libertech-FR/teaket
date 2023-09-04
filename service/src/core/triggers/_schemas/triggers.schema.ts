import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, ObjectId, Types } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

export type TriggersDocument = Triggers & Document

@Schema({
  collection: 'triggers',
  versionKey: false,
})
export class Triggers extends AbstractSchema {
  @Prop({
    required: true,
    type: String,
  })
  public name: string

  @Prop({
    required: true,
    type: String,
  })
  public description: string

  @Prop({
    required: true,
    type: Object,
  })
  public actions: { [key: string]: any }

  @Prop({
    required: true,
    type: Types.ObjectId,
  })
  public pluginId: ObjectId

  @Prop({
    required: true,
    type: Boolean,
  })
  public disabled: boolean
}

export const TriggersSchema = SchemaFactory.createForClass(Triggers)

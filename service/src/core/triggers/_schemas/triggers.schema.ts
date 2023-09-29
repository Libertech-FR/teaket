import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ObjectId, Types } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({
  collection: 'triggers',
  versionKey: false,
})
export class Triggers extends AbstractSchema {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  public name: string

  @Prop({
    type: String,
  })
  public description: string

  @Prop({
    required: true,
    type: Object,
  })
  public actions: { [key: string]: any } // eslint-disable-line

  @Prop({
    type: Types.ObjectId,
  })
  public pluginId?: ObjectId

  @Prop({
    type: Boolean,
    default: false,
  })
  public disabled: boolean
}

export const TriggersSchema = SchemaFactory.createForClass(Triggers)

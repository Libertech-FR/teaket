import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ObjectId, Types } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({
  collection: 'crontabs',
  versionKey: false,
})
export class Crontabs extends AbstractSchema {
  @Prop({
    required: true,
    type: String,
  })
  public name: string

  @Prop({ type: String })
  public description: string

  @Prop({
    required: true,
    type: String,
    //TODO: validate cron expression
  })
  public interval: string

  @Prop({
    required: true,
    type: [Object],
  })
  public actions: { [key: string]: any }[] // eslint-disable-line

  @Prop({ type: Types.ObjectId })
  public pluginId?: ObjectId

  @Prop({
    type: Boolean,
    default: false,
  })
  public disabled: boolean
}

export const CrontabsSchema = SchemaFactory.createForClass(Crontabs)

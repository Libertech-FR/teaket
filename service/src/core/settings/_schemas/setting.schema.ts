import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { Schema as MongooseSchema } from 'mongoose'
import { MixedSettingValue } from '~/core/settings/settings.interface'
import { SettingFor, SettingForList } from '~/core/settings/_enum/setting-for.enum'

@Schema({
  collection: 'settings',
  versionKey: false,
})
export class Setting extends AbstractSchema {
  @Prop({
    type: String,
    required: true,
  })
  public key: string

  @Prop({
    type: Number,
    default: SettingFor.ALL,
    enum: SettingForList,
  })
  public for: SettingFor

  @Prop({
    type: String,
  })
  public scope?: string

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  public value: MixedSettingValue
}

export const SettingSchema = SchemaFactory.createForClass(Setting)
  .index({ key: 1, for: 1, scope: 1 }, { unique: true })

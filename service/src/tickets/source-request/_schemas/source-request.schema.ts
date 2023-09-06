import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { RulePart, RulePartSchema } from '~/tickets/source-request/_schemas/parts/rules.part.schema'

@Schema({
  collection: 'source-requests',
  versionKey: false,
})
export class SourceRequest extends AbstractSchema {
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
    type: String,
  })
  public icon?: string

  @Prop({
    type: String,
  })
  public color?: string

  @Prop({
    type: [RulePartSchema],
    required: true,
  })
  public rules: RulePart[]

  @Prop({
    type: String,
  })
  public backgroundColor?: string

  @Prop({
    type: Number,
    default: 0,
  })
  public order: number

  @Prop({
    type: Object,
  })
  public customFields?: { [key: string]: any }
}

export const SourceRequestSchema = SchemaFactory.createForClass(SourceRequest)

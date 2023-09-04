import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { RulePart, RulePartSchema } from '~/tickets/sla/_schemas/parts/rules.part.schema'

@Schema({
  collection: 'sla',
  versionKey: false,
})
export class Sla extends AbstractSchema {
  @Prop({
    type: String,
    required: true,
  })
  public name: string

  @Prop({
    type: String,
    required: true,
  })
  public description: string

  @Prop({
    type: String,
    required: true,
  })
  public icon: string

  @Prop({
    type: String,
    required: true,
  })
  public color: string

  @Prop({
    type: [RulePartSchema],
    required: true,
  })
  public rules: RulePart[]

  @Prop({
    type: String,
    required: true,
  })
  public backgroundColor: string

  @Prop({
    type: Number,
    required: true,
  })
  public order: number

  @Prop({
    type: Number,
    required: true,
    validate: (value: number) => value > 0,
  })
  public timeToExpire: number

  @Prop({
    type: Object,
  })
  public customFields: object
}

export const SlaSchema = SchemaFactory.createForClass(Sla)

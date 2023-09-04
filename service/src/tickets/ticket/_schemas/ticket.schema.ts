import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { AutoIncrementPlugin } from '~/_common/plugins/mongoose/auto-increment.plugin'
import { AutoIncrementPluginOptions } from '~/_common/plugins/mongoose/auto-increment.interface'
import { IdnamePart, IdnamePartSchema } from '~/_common/schemas/parts/idname.part.schema'
import { TicketTypeList } from '~/tickets/ticket/_enum/ticket-type.enum'
import { TicketLifestepList } from '~/tickets/ticket/_enum/ticket-lifestep.enum'
import { Types } from 'mongoose'
import { SlaPart, SlaPartSchema } from '~/tickets/ticket/_schemas/parts/sla.part.schema'
import { TagPart, TagPartSchema } from '~/tickets/ticket/_schemas/parts/tag.part.schema'
import { EnvelopePart, EnvelopePartSchema } from '~/tickets/ticket/_schemas/parts/envelope.part.schema'

@Schema({
  collection: 'tickets',
  versionKey: false,
})
export class Ticket extends AbstractSchema {
  @Prop({
    unique: true,
    type: String,
    validate: [(sequence: string) => /[A-Za-z0-9_-]+/.test(sequence), 'Numéro de tickets invalide.'],
  })
  public sequence: string

  @Prop({
    type: EnvelopePartSchema,
    required: true,
  })
  public envelope: EnvelopePart

  @Prop({
    required: true,
    type: String,
  })
  public subject: string

  @Prop({
    type: Number,
    enum: TicketTypeList,
    required: true,
  })
  public type: number

  @Prop({
    type: [TagPartSchema],
    required: true,
  })
  public tags: TagPart[]

  @Prop({
    type: Number,
    enum: TicketLifestepList,
    required: true,
  })
  public lifestep: number

  @Prop({ type: Types.ObjectId })
  public parentId?: Types.ObjectId

  @Prop({
    type: IdnamePartSchema,
    required: true,
  })
  public state: IdnamePart

  @Prop({
    type: IdnamePartSchema,
    required: true,
  })
  public project: IdnamePart

  @Prop({
    type: IdnamePartSchema,
    required: true,
  })
  public priority: IdnamePart

  @Prop({
    type: IdnamePartSchema,
    required: true,
  })
  public impact: IdnamePart

  @Prop({
    type: SlaPartSchema,
    required: true,
  })
  public sla: SlaPart

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  public totalTime: number

  @Prop({
    type: [String],
    default: [],
  })
  public readFlags: string[]

  @Prop({
    type: Object,
  })
  public customFields?: { [key: string]: any }
}

export const TicketSchema = SchemaFactory.createForClass(Ticket)
  .plugin(AutoIncrementPlugin, <AutoIncrementPluginOptions>{
    incrementBy: 1,
    field: 'sequence',
    startAt: 1,
  })
  .pre('save', function(next) {
    if (this.isNew) {
      this.sequence = 'LT' + this.sequence.padStart(6, '0') //TODO: get prefix from config
    }
    next()
  })

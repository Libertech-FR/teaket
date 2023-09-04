import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { AutoIncrementPlugin } from '~/_common/plugins/mongoose/auto-increment.plugin'
import { AutoIncrementPluginOptions } from '~/_common/plugins/mongoose/auto-increment.interface'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'

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
    required: true,
    type: String,
  })
  public subject: string

  @Prop({
    type: IdnamePart,
    required: [true, 'Le status du ticket doit être spécifié'],
  })
  public state: IdnamePart

  @Prop({
    type: IdnamePart,
    required: [true, 'Le projet du ticket doit être spécifié'],
  })
  public project: IdnamePart

  @Prop({
    type: IdnamePart,
    required: [true, 'La priorité du ticket doit être spécifié'],
  })
  public priority: IdnamePart

  @Prop({
    type: IdnamePart,
    required: [true, 'L\'impact du ticket doit être spécifié'],
  })
  public impact: IdnamePart
}

export const TicketSchema = SchemaFactory.createForClass(Ticket)
  .plugin(AutoIncrementPlugin, <AutoIncrementPluginOptions>{
    incrementBy: 1,
    field: 'sequence',
    startAt: 1,
  })
  .pre('save', function(next) {
    if (this.isNew) {
      this.sequence = 'LT' + this.sequence.padStart(6, '0')
    }
    next()
  })

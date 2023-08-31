import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/abstract.schema'

@Schema({
  collection: 'tickets',
  versionKey: false,
})
export class Ticket extends AbstractSchema {
  @Prop({
    required: true,
    unique: true,
    type: String,
    validate: [(sequence) => /[A-Za-z0-9]+/.test(sequence), 'Numéro de ticket invalide.'],
  })
  public sequence: string

  @Prop({
    required: true,
    type: String,
  })
  public subject: string
}

export const TicketSchema = SchemaFactory.createForClass(Ticket)

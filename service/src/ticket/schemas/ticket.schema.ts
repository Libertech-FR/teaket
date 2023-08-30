import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/abstract.schema'

export type TicketDocument = Ticket & Document

@Schema({ versionKey: false })
export class Ticket extends AbstractSchema {}

export const TicketSchema = SchemaFactory.createForClass(Ticket)

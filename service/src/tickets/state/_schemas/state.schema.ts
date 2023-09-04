import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({
  collection: 'states',
  versionKey: false,
})
export class State extends AbstractSchema {
}

export const StateSchema = SchemaFactory.createForClass(State)

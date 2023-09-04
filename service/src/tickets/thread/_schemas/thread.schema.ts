import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({
  collection: 'threads',
  versionKey: false,
})
export class Thread extends AbstractSchema {}

export const ThreadSchema = SchemaFactory.createForClass(Thread)

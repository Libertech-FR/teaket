import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({
  collection: 'identities',
  versionKey: false,
})
export class Identities extends AbstractSchema {}

export const IdentitiesSchema = SchemaFactory.createForClass(Identities)

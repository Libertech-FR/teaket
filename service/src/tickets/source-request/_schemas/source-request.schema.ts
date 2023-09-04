import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

export type SourceRequestDocument = SourceRequest & Document

@Schema({
  collection: 'source-requests',
  versionKey: false,
})
export class SourceRequest extends AbstractSchema {}

export const SourceRequestSchema = SchemaFactory.createForClass(SourceRequest)

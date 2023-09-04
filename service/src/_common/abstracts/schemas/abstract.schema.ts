import { Prop } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'
import { MetadataPartSchema, MetadataPartSchemaSchema } from '~/_common/abstracts/schemas/parts/metadata.part.schema'

export abstract class AbstractSchema extends Document {
  public readonly _id: Types.ObjectId | any

  @Prop({ type: MetadataPartSchemaSchema })
  public metadata: MetadataPartSchema
}

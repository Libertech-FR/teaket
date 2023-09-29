import { Prop } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'
import { MetadataPart, MetadataPartSchema } from '~/_common/abstracts/schemas/parts/metadata.part.schema'

export abstract class AbstractSchema extends Document {
  public readonly _id: Types.ObjectId | any // eslint-disable-line

  @Prop({ type: MetadataPartSchema })
  public metadata: MetadataPart
}

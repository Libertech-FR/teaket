import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ _id: false })
export class MetadataPartSchema extends Document {
  @Prop({ type: String })
  public createdBy: string

  @Prop({ type: Date })
  public createdAt: Date

  @Prop({ type: String })
  public lastUpdatedBy: string

  @Prop({ type: Date })
  public lastUpdatedAt: Date
}

export const MetadataPartSchemaSchema = SchemaFactory.createForClass(MetadataPartSchema)

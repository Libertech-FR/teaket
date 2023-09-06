import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { SourceRequest } from '~/tickets/source-request/_schemas/source-request.schema'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'

@Schema({ _id: false })
export class IdfsPart extends IdnamePart {
  @Prop({
    type: String,
    required: true,
  })
  public namespace: string

  @Prop({
    type: String,
    required: true,
  })
  public path: string

  @Prop({
    type: String,
  })
  public mime: string
}

export const IdfsPartSchema = SchemaFactory.createForClass(IdfsPart)

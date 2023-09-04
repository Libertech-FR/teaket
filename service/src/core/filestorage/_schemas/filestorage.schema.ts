import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

export type FilestorageDocument = Filestorage & Document

@Schema({
  collection: 'filestorage',
  versionKey: false,
})
export class Filestorage extends AbstractSchema {
  @Prop({
    required: true,
    type: Number,
  })
  public type: number

  @Prop({
    required: true,
    type: String,
  })
  public namespace: string

  @Prop({
    required: true,
    type: String,
  })
  public path: string

  @Prop({
    required: false,
    type: String,
  })
  public comments?: string

  @Prop({
    required: true,
    type: Boolean,
  })
  public hidden: boolean

  @Prop({
    required: false,
    type: Object,
  })
  public tags?: { [key: string]: any }

  @Prop({
    required: false,
    type: Object,
  })
  public acls?: { [key: string]: any }

  @Prop({
    required: false,
    type: Object,
  })
  public customFields?: { [key: string]: any }
}

export const FilestorageSchema = SchemaFactory.createForClass(Filestorage)

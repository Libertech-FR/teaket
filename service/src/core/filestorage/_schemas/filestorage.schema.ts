import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { FsType, FsTypeList } from '~/core/filestorage/_enum/fs-type.enum'

@Schema({
  collection: 'filestorage',
  versionKey: false,
})
export class Filestorage extends AbstractSchema {
  @Prop({
    required: true,
    type: String,
    enum: FsTypeList,
  })
  public type: FsType

  @Prop({
    type: String,
    default: 'application/octet-stream',
  })
  public mime: string

  @Prop({
    required: true,
    type: String,
  })
  public namespace: string

  @Prop({
    required: true,
    type: String,
    //TODO: check file path ..?
  })
  public path: string

  @Prop({
    required: false,
    type: String,
  })
  public comments?: string

  @Prop({
    type: Boolean,
    default: false,
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
  .index({ namespace: 1, path: 1 }, { unique: true })

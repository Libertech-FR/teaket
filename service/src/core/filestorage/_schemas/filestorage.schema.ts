import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { FsType, FsTypeList } from '~/core/filestorage/_enum/fs-type.enum'
import { Types } from 'mongoose'

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
  })
  public mime?: string

  @Prop({
    type: Types.ObjectId,
  })
  public linkedTo?: Types.ObjectId

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
  public tags?: { [key: string]: any } // eslint-disable-line

  @Prop({
    required: false,
    type: Object,
  })
  public acls?: { [key: string]: any } // eslint-disable-line

  @Prop({
    required: false,
    type: Object,
  })
  // eslint-disable-next-line
  public customFields?: { [key: string]: any }
}

export const FilestorageSchema = SchemaFactory.createForClass(Filestorage).index({ namespace: 1, path: 1 }, { unique: true })

FilestorageSchema.virtual('filename').get(function (this: Filestorage): string {
  return this.path.split('/').pop()
})

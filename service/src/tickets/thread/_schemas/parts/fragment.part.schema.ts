import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { FragmentType, FragmentTypeList } from '~/tickets/thread/_enum/fragment-type.enum'
import { Document, Types } from 'mongoose'
import { IdfsPart, IdfsPartSchema } from '~/_common/schemas/parts/idfs.part.schema'

@Schema({ _id: false })
export class FragmentPart extends Document {
  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  public id: Types.ObjectId

  @Prop({
    type: String,
    enum: FragmentTypeList,
    required: true,
  })
  public disposition: FragmentType

  @Prop({
    type: String,
  })
  public message?: string

  @Prop({
    type: IdfsPartSchema,
  })
  public filestorage?: IdfsPart
}

export const FragmentPartSchema = SchemaFactory.createForClass(FragmentPart).pre('validate', function (this: FragmentPart, next: Function): void {
  switch (this.disposition) {
    case FragmentType.RAW: {
      delete this.filestorage
      if (!this.message) {
        next(new Error('Message field is required'))
      }
      break
    }

    case FragmentType.FILE: {
      delete this.message
      if (!this.filestorage) {
        next(new Error('Filestorage field is required'))
      }
      break
    }
  }
  next()
})

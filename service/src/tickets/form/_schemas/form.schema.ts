import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { FormTypes } from '../_enum/types'
import { FormSectionPart, FormSectionPartSchema } from './parts/section.part.schema'
@Schema({
  collection: 'forms',
  versionKey: false,
})
export class Form extends AbstractSchema {
  @Prop()
  title: string

  @Prop()
  description: string

  @Prop({
    type: Number,
    enum: FormTypes,
    default: FormTypes.BASE,
  })
  type: FormTypes

  @Prop({ type: Map, of: FormSectionPartSchema })
  sections: Map<string, FormSectionPart>

  @Prop()
  submitButtonText: string

  @Prop()
  submitApiUrl: string
}

export const FormSchema = SchemaFactory.createForClass(Form)

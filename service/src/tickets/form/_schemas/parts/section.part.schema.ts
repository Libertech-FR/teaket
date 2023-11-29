import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { FormTypes } from '../../_enum/types'
import { FormFieldPart } from './field.part.schema'

@Schema({ _id: false })
export class FormSectionPart {
  @Prop({
    type: String,
  })
  label: string

  @Prop({
    type: Number,
    enum: FormTypes,
    default: FormTypes.BASE,
  })
  type: FormTypes

  @Prop({
    type: String,
  })
  icon?: string

  @Prop({
    type: String,
  })
  description?: string

  @Prop({ type: Map })
  sections?: Map<string, FormSectionPart>

  @Prop({ type: Map })
  fields: Map<string, FormFieldPart>
}

export const FormSectionPartSchema = SchemaFactory.createForClass(FormSectionPart)

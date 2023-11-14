import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { MixedValue } from '~/_common/types/mixed-value.type'
@Schema()
export class FormFieldPart {
  @Prop()
  component: string

  @Prop()
  label: string

  @Prop()
  'model-value': string

  @Prop()
  row: number

  @Prop()
  col: number

  @Prop({
    type: Object,
  })
  attrsOnDefault: { [attr: string]: MixedValue }

  @Prop({
    type: Object,
  })
  attrsOnCreate: { [attr: string]: MixedValue }

  @Prop({
    type: Object,
  })
  attrsOnRead: { [attr: string]: MixedValue }

  @Prop({
    type: Object,
  })
  attrsOnUpdate: { [attr: string]: MixedValue }

  @Prop({
    type: Object,
  })
  attrsOnDelete: { [attr: string]: MixedValue }
}

export const FormFieldPartSchema = SchemaFactory.createForClass(FormFieldPart)

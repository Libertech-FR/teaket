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
    default: {},
  })
  attrsOnDefault: { [attr: string]: MixedValue } | object

  @Prop({
    type: Object,
    default: {},
  })
  attrsOnCreate: { [attr: string]: MixedValue } | object

  @Prop({
    type: Object,
    default: {},
  })
  attrsOnRead: { [attr: string]: MixedValue } | object

  @Prop({
    type: Object,
    default: {},
  })
  attrsOnUpdate: { [attr: string]: MixedValue } | object

  @Prop({
    type: Object,
    default: {},
  })
  attrsOnDelete: { [attr: string]: MixedValue } | object
}

export const FormFieldPartSchema = SchemaFactory.createForClass(FormFieldPart)

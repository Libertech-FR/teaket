import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'
import { FragmentType, FragmentTypeList } from '~/tickets/thread/_enum/fragment-type.enum'

@Schema({ _id: false })
export class FragmentPart extends IdnamePart {
  @Prop({
    type: String,
    enum: FragmentTypeList,
    required: true,
  })
  public disposition: FragmentType

  @Prop({
    type: String,
    required: true,
  })
  public type: string

  @Prop({
    type: String,
    required: true,
  })
  public path: string

  @Prop({
    type: Object,
  })
  public metadata: object
}

export const FragmentPartSchema = SchemaFactory.createForClass(FragmentPart)

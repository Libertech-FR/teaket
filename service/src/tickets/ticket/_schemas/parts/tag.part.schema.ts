import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'

@Schema({ _id: false })
export class TagPart extends IdnamePart {
  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  public manual: boolean

  @Prop({
    type: Object,
  })
  public metadata: object
}

export const TagPartSchema = SchemaFactory.createForClass(TagPart)

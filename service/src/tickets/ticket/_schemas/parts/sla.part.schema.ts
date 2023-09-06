import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'

@Schema({ _id: false })
export class SlaPart extends IdnamePart {
  @Prop({
    type: Date,
    required: true,
    default: new Date(),
  })
  public dueAt: Date

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  public manual: boolean
}

export const SlaPartSchema = SchemaFactory.createForClass(SlaPart)

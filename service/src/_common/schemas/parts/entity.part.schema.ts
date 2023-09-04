import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'
import { EntityTypeList } from '~/_common/enum/entity-type.enum'

@Schema({ _id: false })
export class EntityPart extends IdnamePart {
  @Prop({
    type: Number,
    enum: EntityTypeList,
    required: true,
  })
  public type: number
}

export const EntityPartSchema = SchemaFactory.createForClass(EntityPart)

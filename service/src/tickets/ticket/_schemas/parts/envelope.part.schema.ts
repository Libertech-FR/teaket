import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'
import { EntityPart, EntityPartSchema } from '~/_common/schemas/parts/entity.part.schema'
import { EntityType } from '~/_common/enum/entity-type.enum'

@Schema({ _id: false })
export class EnvelopePart extends IdnamePart {
  @Prop({
    type: [EntityPartSchema],
    required: true,
  })
  public senders: EntityPart[]

  @Prop({
    type: [EntityPartSchema],
    required: true,
  })
  public observers: EntityPart[]

  @Prop({
    type: [EntityPartSchema],
    validate: (v: EntityPart[]) => {
      for (const user of v) {
        if (user.type !== EntityType.AGENT) {
          return false
        }
      }
      return true
    },
    required: true,
  })
  public assigned: EntityPart[]
}

export const EnvelopePartSchema = SchemaFactory.createForClass(EnvelopePart)

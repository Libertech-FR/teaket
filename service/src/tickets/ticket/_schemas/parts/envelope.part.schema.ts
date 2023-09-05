import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'
import { EntityPart, EntityPartSchema } from '~/_common/schemas/parts/entity.part.schema'
import { EntityType } from '~/_common/enum/entity-type.enum'
import { CallbackWithoutResultAndOptionalError } from 'mongoose'

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
    validate: (entities: EntityPart[]): boolean => {
      for (const entity of entities) {
        if (entity.type !== EntityType.AGENT) {
          return false
        }
      }
      return true
    },
    default: [],
  })
  public assigned: EntityPart[]
}

export const EnvelopePartSchema = SchemaFactory.createForClass(EnvelopePart)
  .pre('save', function(next: CallbackWithoutResultAndOptionalError): void {
    if (this.observers.length === 0) {
      this.observers = this.senders
    }
    next()
  })

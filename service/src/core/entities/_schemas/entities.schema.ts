import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { ProfilePart, ProfilePartSchema } from '~/core/entities/_schemas/parts/profile.part.schema'
import { StatePart, StatePartSchema } from '~/core/entities/_schemas/parts/state.part.schema'
import { EntityType, EntityTypeList } from '~/_common/enum/entity-type.enum'

@Schema({
  collection: 'entities',
  versionKey: false,
})
export class Entity extends AbstractSchema {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  public publicEmail: string

  @Prop({
    type: Number,
    enum: EntityTypeList,
    required: true,
  })
  public type: EntityType

  @Prop({
    type: ProfilePartSchema,
    required: true,
  })
  public profile: ProfilePart

  @Prop({
    type: StatePartSchema,
    default: {},
  })
  public state: StatePart

  @Prop({
    type: Object,
  })
  // eslint-disable-next-line
  public customFields?: { [key: string]: any }
}

export const EntitySchema = SchemaFactory.createForClass(Entity)

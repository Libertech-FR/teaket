import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { ProfilePart, ProfilePartSchema } from '~/core/entites/_schemas/parts/profile.part.schema'

@Schema({
  collection: 'entites',
  versionKey: false,
})
export class Entity extends AbstractSchema {
  @Prop({
    type: String,
    required: true,
  })
  public publicEmail: string

  @Prop({
    type: ProfilePartSchema,
    required: true,
  })
  public profile: ProfilePart
}

export const EntitySchema = SchemaFactory.createForClass(Entity)

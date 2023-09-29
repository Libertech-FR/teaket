import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({
  collection: 'projects',
  versionKey: false,
})
export class Project extends AbstractSchema {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  public name: string

  @Prop({
    type: Date,
    default: new Date(),
  })
  public startDate: Date

  @Prop({
    type: Date,
  })
  public endDate?: Date

  @Prop({
    type: Object,
  })
  public rules?: { [key: string]: any } // eslint-disable-line

  @Prop({
    type: String,
  })
  public description: string

  @Prop({
    type: Object,
  })
  public customFields?: { [key: string]: any }
}

export const ProjectSchema = SchemaFactory.createForClass(Project)

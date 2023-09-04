import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

export type ProjectDocument = Project & Document

@Schema({ versionKey: false })
export class Project extends AbstractSchema {
  @Prop({
    required: true,
    type: String,
  })
  public name: string

  @Prop({
    required: true,
    type: Date,
  })
  public startDate: Date

  @Prop({
    required: true,
    type: Date,
  })
  public endDate: Date

  @Prop({
    type: Object,
  })
  public rules?: { [key: string]: any }

  @Prop({
    required: true,
    type: String,
  })
  public description: string

  @Prop({
    type: Object,
  })
  public customFields?: { [key: string]: any }
}

export const ProjectSchema = SchemaFactory.createForClass(Project)

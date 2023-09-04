import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({
  collection: 'categories',
  versionKey: false,
})
export class Categories extends AbstractSchema {
  @Prop({
    required: true,
    type: String,
  })
  public name: string

  @Prop({
    required: true,
    type: String,
  })
  public description: string

  @Prop({ type: Types.ObjectId })
  public parent?: Types.ObjectId

  @Prop({
    required: true,
    type: Number,
  })
  public order: number

  @Prop({
    required: true,
    type: Boolean,
    default: true,
  })
  public selectable: boolean

  @Prop({
    required: true,
    type: Boolean,
    default: false,
  })
  public disabled: boolean

  @Prop({
    type: String,
  })
  public icon?: string

  @Prop({
    type: String,
  })
  public color?: string

  @Prop({
    type: Object,
  })
  public customFields?: { [key: string]: any }
}

export const CategoriesSchema = SchemaFactory.createForClass(Categories)

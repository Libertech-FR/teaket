import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'
import { Types } from 'mongoose'
import { MixedValue } from '~/_common/types/mixed-value.type'

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
    type: String,
  })
  public description: string

  @Prop({ type: Types.ObjectId })
  public parentId?: Types.ObjectId

  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  public order: number

  @Prop({
    type: Boolean,
    default: true,
  })
  public selectable: boolean

  @Prop({
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
  public customFields?: { [key: string]: MixedValue }
}

export const CategoriesSchema = SchemaFactory.createForClass(Categories)
  .index({ name: 1, parentId: 1 }, { unique: true })

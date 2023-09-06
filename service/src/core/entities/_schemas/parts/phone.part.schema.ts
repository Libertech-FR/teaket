import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { EntityState, EntityStateList } from '~/core/entities/_enum/entity-state.enum'
import { ProfilePart } from '~/core/entities/_schemas/parts/profile.part.schema'
import { PhoneType, PhoneTypeList } from '~/core/entities/_enum/phone-type.enum'

@Schema({ _id: false })
export class PhonePart extends Document {
  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  public id: Types.ObjectId

  @Prop({
    type: Number,
    enum: PhoneTypeList,
    required: true,
  })
  public type: PhoneType

  @Prop({
    type: String,
    required: true,
  })
  public phoneNumber: string

  @Prop({
    type: String,
  })
  public description: string
}

export const PhonePartSchema = SchemaFactory.createForClass(PhonePart)

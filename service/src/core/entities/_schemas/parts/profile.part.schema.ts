import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { PhonePart, PhonePartSchema } from '~/core/entities/_schemas/parts/phone.part.schema'

@Schema({ _id: false })
export class ProfilePart extends Document {
  @Prop({
    type: String,
    required: true,
  })
  public commonName: string

  @Prop({
    type: String,
  })
  public firstName: string

  @Prop({
    type: String,
  })
  public lastName: string

  @Prop({
    type: String,
  })
  public thirdName?: string

  @Prop({
    type: String,
  })
  public avatar?: string

  @Prop({
    type: [PhonePartSchema],
  })
  public phones?: PhonePart[]
}

export const ProfilePartSchema = SchemaFactory.createForClass(ProfilePart)

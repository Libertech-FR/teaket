import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ _id: false })
export class ProfilePart extends Document {
  @Prop({
    type: String,
    required: true,
  })
  public firstName: string

  @Prop({
    type: String,
    required: true,
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
}

export const ProfilePartSchema = SchemaFactory.createForClass(ProfilePart)
ProfilePartSchema.virtual('commonName').get(function (this: ProfilePart): string {
  const commonNamePart = [this.firstName]
  if (this.thirdName) commonNamePart.push(this.thirdName)
  commonNamePart.push(this.lastName)
  return commonNamePart.join(' ')
})

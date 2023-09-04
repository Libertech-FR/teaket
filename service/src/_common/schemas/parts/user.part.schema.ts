import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'
import { UserTypeList } from '~/_common/enum/user-type.enum'

@Schema({ _id: false })
export class UserPart extends IdnamePart {

  @Prop({
    type: Number,
    enum: UserTypeList,
    required: [true, 'Type obligatoire'],
  })
  public type: number
}

export const UserPartSchema = SchemaFactory.createForClass(UserPart)

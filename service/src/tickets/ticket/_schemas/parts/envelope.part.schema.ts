import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IdnamePart } from '~/_common/schemas/parts/idname.part.schema'
import { UserPart, UserPartSchema } from '~/_common/schemas/parts/user.part.schema'
import { UserType } from '~/_common/enum/user-type.enum'

@Schema({ _id: false })
export class EnvelopePart extends IdnamePart {
  @Prop({
    type: [UserPartSchema],
    required: true,
  })
  public senders: UserPart[]

  @Prop({
    type: [UserPartSchema],
    required: true,
  })
  public observers: UserPart[]

  @Prop({
    type: [UserPartSchema],
    validate: (v: UserPart[]) => {
      for (const user of v) {
        if (user.type !== UserType.AGENT) {
          return false
        }
      }
      return true
    },
    required: true,
  })
  public assigned: UserPart[]
}

export const EnvelopePartSchema = SchemaFactory.createForClass(EnvelopePart)

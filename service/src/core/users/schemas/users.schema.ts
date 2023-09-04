import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({ versionKey: false })
export class Users extends AbstractSchema {
}

export const UsersSchema = SchemaFactory.createForClass(Users)

import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ _id: false })
export class RulePart extends Document {}

export const RulePartSchema = SchemaFactory.createForClass(RulePart)

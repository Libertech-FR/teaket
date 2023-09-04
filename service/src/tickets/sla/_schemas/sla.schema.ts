import { Schema, SchemaFactory } from '@nestjs/mongoose'
import { AbstractSchema } from '~/_common/abstracts/schemas/abstract.schema'

@Schema({ versionKey: false })
export class Sla extends AbstractSchema {
}

export const SlaSchema = SchemaFactory.createForClass(Sla)

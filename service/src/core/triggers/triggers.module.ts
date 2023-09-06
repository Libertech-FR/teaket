import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TriggersSchema, Triggers } from './_schemas/triggers.schema'
import { TriggersService } from './triggers.service'
import { TriggersController } from './triggers.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Triggers.name,
        useFactory: () => TriggersSchema,
      },
    ]),
  ],
  providers: [TriggersService],
  controllers: [TriggersController],
})
export class TriggersModule {}

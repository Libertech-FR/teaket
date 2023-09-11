import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Entity, EntitySchema } from '~/core/entities/_schemas/entities.schema'
import { EntitiesService } from './entities.service'
import { EntitiesController } from './entities.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Entity.name,
        useFactory: () => EntitySchema,
      },
    ]),
  ],
  providers: [EntitiesService],
  controllers: [EntitiesController],
  exports: [EntitiesService],
})
export class EntitiesModule {}

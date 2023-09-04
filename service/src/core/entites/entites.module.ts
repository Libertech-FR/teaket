import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Entity, EntitySchema } from '~/core/entites/_schemas/entites.schema'
import { EntitesService } from './entites.service'
import { EntitesController } from './entites.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Entity.name,
        useFactory: () => EntitySchema,
      },
    ]),
  ],
  providers: [EntitesService],
  controllers: [EntitesController],
})
export class EntitesModule {}

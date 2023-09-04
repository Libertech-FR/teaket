import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CategoriesSchema, Categories } from './_schemas/categories.schema'
import { CategoriesService } from './categories.service'
import { CategoriesController } from './categories.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Categories.name,
        useFactory: () => CategoriesSchema,
      },
    ]),
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}

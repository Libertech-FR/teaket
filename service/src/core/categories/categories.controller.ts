import { Controller } from '@nestjs/common'
import { CategoriesCreateDto } from './dto/categories.dto'
import { CategoriesService } from './categories.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'

@Controller('categories')
export class CategoriesController extends AbstractController {
  constructor(private readonly service: CategoriesService) {
    super()
  }
}

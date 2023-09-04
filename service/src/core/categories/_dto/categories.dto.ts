import { PartialType } from '@nestjs/swagger'

export class CategoriesCreateDto {

}

export class CategoriesUpdateDto extends PartialType(CategoriesCreateDto) {
}

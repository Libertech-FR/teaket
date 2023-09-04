import { PartialType } from '@nestjs/swagger'

export class EntitiesCreateDto {

}

export class EntitiesUpdateDto extends PartialType(EntitiesCreateDto) {
}

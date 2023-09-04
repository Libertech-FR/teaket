import { PartialType } from '@nestjs/swagger'

export class StatesCreateDto {
}

export class StatesUpdateDto extends PartialType(StatesCreateDto) {
}

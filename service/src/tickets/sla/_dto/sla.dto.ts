import { PartialType } from '@nestjs/swagger'

export class SlaDto {
}

export class SlaCreateDto {
}

export class SlaUpdateDto extends PartialType(SlaCreateDto) {
}

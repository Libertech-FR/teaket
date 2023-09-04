import { PartialType } from '@nestjs/swagger'

export class SourceRequestCreateDto {
}

export class SourceRequestUpdateDto extends PartialType(SourceRequestCreateDto) {
}

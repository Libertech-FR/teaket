import { PartialType } from "@nestjs/swagger"

export class TriggersCreateDto {

}

export class TriggersUpdateDto extends PartialType(TriggersCreateDto) {}
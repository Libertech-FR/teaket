import { PartialType } from "@nestjs/swagger"

export class IdentitiesCreateDto {

}

export class IdentitiesUpdateDto extends PartialType(IdentitiesCreateDto) {}
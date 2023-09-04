import { PartialType } from "@nestjs/swagger"

export class FilestorageCreateDto {

}

export class FilestorageUpdateDto extends PartialType(FilestorageCreateDto) {}
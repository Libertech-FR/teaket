import { PartialType } from "@nestjs/swagger"

export class PreferencesCreateDto {

}

export class PreferencesUpdateDto extends PartialType(PreferencesCreateDto) {}
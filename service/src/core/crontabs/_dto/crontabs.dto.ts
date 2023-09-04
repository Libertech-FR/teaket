import { PartialType } from "@nestjs/swagger"

export class CrontabsCreateDto {

}

export class CrontabsUpdateDto extends PartialType(CrontabsCreateDto) {}
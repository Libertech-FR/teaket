import { PartialType } from "@nestjs/swagger"

export class ProjectCreateDto {

}

export class ProjectUpdateDto extends PartialType(ProjectCreateDto) {}
import { IsString, IsOptional, IsDate, IsObject, IsMongoId } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { AbstractCustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'

export class ProjectCreateDto extends AbstractCustomFieldsDto {
  @IsString()
  @ApiProperty()
  public name: string

  @IsDate()
  @IsOptional()
  @ApiProperty()
  public startDate?: Date

  @IsDate()
  @IsOptional()
  @ApiProperty()
  public endDate?: Date

  @IsObject()
  @IsOptional()
  @ApiProperty()
  public rules?: { [key: string]: any }

  @IsString()
  @IsOptional()
  @ApiProperty()
  public description?: string
}

export class ProjectDto extends ProjectCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class ProjectUpdateDto extends ProjectCreateDto {}

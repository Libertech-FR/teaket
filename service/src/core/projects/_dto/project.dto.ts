import { IsString, IsOptional, IsDate, IsObject, IsMongoId, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CustomFieldsDto } from '~/_common/abstracts/dto/custom-fields.dto'

export class ProjectCreateDto extends CustomFieldsDto {
  @IsString()
  @IsNotEmpty()
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
  @ApiProperty({ type: Object })
  public rules?: { [key: string]: any } // eslint-disable-line

  @IsString()
  @IsOptional()
  @ApiProperty()
  public description?: string
}

export class ProjectDto extends ProjectCreateDto {
  @IsMongoId()
  @ApiProperty({ type: String })
  public _id: string
}

export class ProjectUpdateDto extends ProjectCreateDto {}

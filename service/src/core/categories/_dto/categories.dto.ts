import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator'
import { CustomFieldsDto } from '~/_common/abstracts/dto/custom-fields.dto'

export class CategoriesCreateDto extends CustomFieldsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public description?: string

  @IsMongoId()
  @IsOptional()
  @ApiProperty({ type: String })
  public parentId?: string

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  public order?: number

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public selectable?: boolean

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public disabled?: boolean

  @IsString()
  @IsOptional()
  @ApiProperty()
  public icon?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public color?: string
}

export class CategoriesDto extends CategoriesCreateDto {
  @IsMongoId()
  @ApiProperty({ type: String })
  public _id: string
}

export class CategoriesUpdateDto extends PartialType(CategoriesCreateDto) {}

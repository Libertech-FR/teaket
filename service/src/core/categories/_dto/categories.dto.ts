import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsBoolean, IsMongoId } from 'class-validator'
import { AbstractCustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'

export class CategoriesCreateDto extends AbstractCustomFieldsDto {
  @IsString()
  @ApiProperty()
  public name: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public description: string

  @IsMongoId()
  @IsOptional()
  @ApiProperty()
  public parentId?: string

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  public order: number

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public selectable: boolean

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public disabled: boolean

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
  @IsString()
  @ApiProperty()
  public _id: string
}

export class CategoriesUpdateDto extends PartialType(CategoriesCreateDto) {
}

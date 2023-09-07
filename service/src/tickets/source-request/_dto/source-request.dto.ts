import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CustomFieldsDto } from '~/_common/abstracts/dto/custom-fields.dto'
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class SourceRequestCreateDto extends CustomFieldsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public description?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public icon?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public color?: string

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [Object] })
  public rules: { [key: string]: any }[]

  @IsString()
  @IsOptional()
  @ApiProperty()
  public backgroundColor?: string

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  public order?: number
}

export class SourceRequestDto extends SourceRequestCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class SourceRequestUpdateDto extends PartialType(SourceRequestCreateDto) {}

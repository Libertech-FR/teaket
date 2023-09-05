import { ApiProperty, PartialType } from '@nestjs/swagger'
import { AbstractCustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'
import { IsArray, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class SlaCreateDto extends AbstractCustomFieldsDto {
  @IsString()
  @ApiProperty()
  public name: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  public description?: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  public icon?: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  public color?: string

  @IsArray()
  @IsOptional()
  @ApiProperty()
  public rules: { [key: string]: any }[]

  @IsOptional()
  @IsString()
  @ApiProperty()
  public backgroundColor?: string

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  public order?: number

  @IsNumber()
  @Min(1)
  @ApiProperty()
  public timeToExpire: number
}

export class SlaDto extends SlaCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class SlaUpdateDto extends PartialType(SlaCreateDto) {
}

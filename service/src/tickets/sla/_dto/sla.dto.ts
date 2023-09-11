import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CustomFieldsDto } from '~/_common/abstracts/dto/custom-fields.dto'
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class SlaCreateDto extends CustomFieldsDto {
  @IsString()
  @IsNotEmpty()
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
  @ApiProperty({ type: [Object] })
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
  @Min(0)
  @ApiProperty()
  public timeToExpire: number
}

export class SlaDto extends SlaCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class SlaUpdateDto extends PartialType(SlaCreateDto) {}

import { ApiProperty, PartialType } from '@nestjs/swagger'
import { AbstractCustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class StatesCreateDto extends AbstractCustomFieldsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  public description: string

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
  @ApiProperty({ type: [Object] })
  public rules: { [key: string]: any }[]

  @IsOptional()
  @IsString()
  @ApiProperty()
  public backgroundColor?: string

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  public order: number
}

export class StatesDto extends StatesCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class StatesUpdateDto extends PartialType(StatesCreateDto) {
}

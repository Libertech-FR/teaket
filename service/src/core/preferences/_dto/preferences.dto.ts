import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsObject, IsOptional, ValidateNested, IsMongoId } from 'class-validator'

export class PreferencesCreateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string

  @IsMongoId()
  @IsOptional()
  @ApiProperty()
  public entityId?: string

  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @ApiProperty()
  public data?: { [key: string]: any }
}

export class PreferencesDto extends PreferencesCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class PreferencesUpdateDto extends PartialType(PreferencesCreateDto) {}

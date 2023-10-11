import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsObject, IsOptional, ValidateNested, IsMongoId } from 'class-validator'
import { MixedValue } from '~/_common/types/mixed-value.type'

export class PreferencesCreateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string

  @IsMongoId()
  @IsOptional()
  @ApiProperty({ type: String })
  public entityId?: string

  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @ApiProperty({ type: Object })
  public data?: { [key: string]: MixedValue }
}

export class PreferencesDto extends PreferencesCreateDto {
  @IsMongoId()
  @ApiProperty({ type: String })
  public _id: string
}

export class PreferencesUpdateDto extends PartialType(PreferencesCreateDto) {
}

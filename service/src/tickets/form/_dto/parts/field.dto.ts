import { ApiProperty } from '@nestjs/swagger'
import { IsString, ValidateNested } from 'class-validator'
import { MixedValue } from '~/_common/types/mixed-value.type'
export class FormFieldDto {
  @IsString()
  @ApiProperty()
  component: string

  @IsString()
  @ApiProperty()
  label: string

  @IsString()
  @ApiProperty()
  'model-value': string

  @IsString()
  @ApiProperty()
  row: number

  @IsString()
  @ApiProperty()
  col: number

  @ValidateNested()
  @ApiProperty()
  attrsOnDefault: { [attr: string]: MixedValue }

  @ValidateNested()
  @ApiProperty()
  attrsOnCreate: { [attr: string]: MixedValue }

  @ValidateNested()
  @ApiProperty()
  attrsOnRead: { [attr: string]: MixedValue }

  @ValidateNested()
  @ApiProperty()
  attrsOnUpdate: { [attr: string]: MixedValue }

  @ValidateNested()
  @ApiProperty()
  attrsOnDelete: { [attr: string]: MixedValue }
}

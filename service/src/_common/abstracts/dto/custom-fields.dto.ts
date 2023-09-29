import { IsObject, IsOptional, ValidateNested } from 'class-validator'
import { MixedValue } from '~/_common/types/mixed-value.type'

export class CustomFieldsDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  public customFields?: { [key: string]: MixedValue }
}

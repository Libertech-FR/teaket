import { IsObject, IsOptional, ValidateNested } from 'class-validator'

export class CustomFieldsDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  public customFields?: { [key: string]: any }
}

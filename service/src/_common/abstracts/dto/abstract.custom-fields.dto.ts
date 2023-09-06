import { IsObject, IsOptional, ValidateNested } from 'class-validator'

export abstract class AbstractCustomFieldsDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  public customFields?: { [key: string]: any }[]
}

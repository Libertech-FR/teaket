# Create new DTO
## For crud operations
```ts
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'
import { IsMongoId } from 'class-validator'

export class [NAME]CreateDto extends CustomFieldsDto {
  [FIELDS_HERE...]
}

export class [NAME]Dto extends [NAME]CreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class [NAME]UpdateDto extends PartialType([NAME]CreateDto) {
}
```

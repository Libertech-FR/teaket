import { ApiProperty, PartialType } from '@nestjs/swagger'
import { AbstractCustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'
import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ProfilePartDto } from '~/core/entities/_dto/parts/profile.part.dto'
import { StatePartDto } from '~/core/entities/_dto/parts/state.part.dto'

export class EntitiesCreateDto extends AbstractCustomFieldsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public publicEmail: string

  @ValidateNested()
  @Type(() => ProfilePartDto)
  @IsNotEmpty()
  @ApiProperty()
  public profile: ProfilePartDto

  @ValidateNested()
  @Type(() => StatePartDto)
  @IsOptional()
  @ApiProperty()
  public state?: StatePartDto
}

export class EntitiesDto extends EntitiesCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class EntitiesUpdateDto extends PartialType(EntitiesCreateDto) {
}

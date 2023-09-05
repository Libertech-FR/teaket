import { ApiProperty, PartialType } from '@nestjs/swagger'
import { AbstractCustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'
import { Type } from 'class-transformer'
import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'
import { ProfilePartDto } from '~/core/entities/_dto/parts/profile.part.dto'
import { StatePartDto } from '~/core/entities/_dto/parts/state.part.dto'
import { EntityType, EntityTypeList } from '~/_common/enum/entity-type.enum'

export class EntitiesCreateDto extends AbstractCustomFieldsDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  public publicEmail: string

  @IsEnum(EntityTypeList)
  @IsNotEmpty()
  @ApiProperty({ enum: EntityTypeList })
  public type: EntityType

  @ValidateNested()
  @Type(() => ProfilePartDto)
  @IsNotEmpty()
  @ApiProperty({ type: ProfilePartDto })
  public profile: ProfilePartDto

  @ValidateNested()
  @Type(() => StatePartDto)
  @IsOptional()
  @ApiProperty({ type: StatePartDto })
  public state?: StatePartDto
}

export class EntitiesDto extends EntitiesCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class EntitiesUpdateDto extends PartialType(EntitiesCreateDto) {
}

import { IsEnum, IsNumber, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { IdnamePartDto } from '~/_common/dto/parts/idname.part.dto'
import { EntityType, EntityTypeList } from '~/_common/enum/entity-type.enum'

export class EntityPartDto extends IdnamePartDto {
  @IsNumber()
  @IsEnum(EntityTypeList)
  @ApiProperty({ enum: EntityTypeList })
  public type: EntityType
}

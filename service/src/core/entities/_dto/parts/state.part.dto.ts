import { IsEnum, IsNotEmpty, IsOptional, IsDate } from 'class-validator'
import { EntityState, EntityStateList } from '~/core/entities/_enum/entity-state.enum'
import { ApiProperty } from '@nestjs/swagger'

export class StatePartDto {
  @IsEnum(EntityStateList)
  @IsNotEmpty()
  @ApiProperty({ enum: EntityStateList })
  public current: EntityState

  @IsDate()
  @IsOptional()
  @ApiProperty()
  public lastChangedAt?: Date
}

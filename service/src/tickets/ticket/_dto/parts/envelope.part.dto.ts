import { IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { IdnamePartDto } from '~/_common/dto/parts/idname.part.dto'
import { EntityPartDto } from '~/_common/dto/parts/entity.part.dto'
import { ApiProperty } from '@nestjs/swagger'

export class EnvelopePartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdnamePartDto)
  @ApiProperty({ type: [IdnamePartDto] })
  public senders: EntityPartDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntityPartDto)
  @ApiProperty({ type: [IdnamePartDto] })
  public observers: EntityPartDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntityPartDto)
  @ApiProperty({ type: [IdnamePartDto] })
  public assigned: EntityPartDto[]
}

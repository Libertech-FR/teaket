import { ValidateNested, IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'
import { EntityPartDto } from '~/_common/dto/parts/entity.part.dto'
import { ApiProperty } from '@nestjs/swagger'

export class EnvelopePartDto {
  // @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EntityPartDto)
  @ApiProperty({ type: [EntityPartDto] })
  public senders: EntityPartDto[]

  // @IsArray()
  // @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EntityPartDto)
  @ApiProperty({ type: [EntityPartDto] })
  public observers: EntityPartDto[]

  // @IsArray()
  // @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EntityPartDto)
  @ApiProperty({ type: [EntityPartDto] })
  public assigned: EntityPartDto[]
}

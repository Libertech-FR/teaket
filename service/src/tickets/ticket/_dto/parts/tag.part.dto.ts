import { IdnamePartDto } from '~/_common/dto/parts/idname.part.dto'
import { IsBoolean, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class TagPartDto extends IdnamePartDto {
  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public manual: boolean
}

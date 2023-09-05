import { IdnamePartDto } from '~/_common/dto/parts/idname.part.dto'
import { IsBoolean, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class TagPartDto extends IdnamePartDto {
  @IsBoolean()
  @ApiProperty()
  public manual: boolean

  @IsOptional()
  @ApiProperty()
  //TODO: check utility of this property
  public metadata: object
}

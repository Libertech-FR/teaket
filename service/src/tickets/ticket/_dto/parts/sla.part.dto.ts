import { IdnamePartDto } from '~/_common/dto/parts/idname.part.dto'
import { IsBoolean, IsDate } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SlaPartDto extends IdnamePartDto {
  @IsDate()
  @ApiProperty()
  public dueAt: Date

  @IsBoolean()
  @ApiProperty()
  public manual: boolean
}

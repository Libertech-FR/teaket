import { ApiProperty } from '@nestjs/swagger'

export class AppInfoDto {
  @ApiProperty()
  public name: string

  @ApiProperty()
  public version: string
}

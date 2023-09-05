import { IsMongoId, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class IdnamePartDto {
  @IsMongoId()
  @IsString()
  @ApiProperty()
  public id: string

  @IsString()
  @ApiProperty()
  public name: string
}

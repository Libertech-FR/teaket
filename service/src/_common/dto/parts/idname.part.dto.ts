import { IsMongoId, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class IdnamePartDto {
  @IsMongoId()
  @ApiProperty()
  public id: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string
}

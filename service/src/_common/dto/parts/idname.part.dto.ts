import { IsMongoId, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Types } from 'mongoose'

export class IdnamePartDto {
  @IsMongoId({ message: 'Id invalide' })
  @ApiProperty({ type: String })
  public id: Types.ObjectId

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string
}

import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Types } from 'mongoose'

export class MailaddressPartDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public address: string

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  public name?: string

  @IsMongoId({ message: 'Id invalide' })
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  public entityId?: Types.ObjectId
}

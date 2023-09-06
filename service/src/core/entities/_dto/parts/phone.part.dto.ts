import { PhoneType, PhoneTypeList } from '~/core/entities/_enum/phone-type.enum'
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsPhoneNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class PhonePartDto {
  @IsEnum(PhoneTypeList)
  @IsNotEmpty()
  @ApiProperty({ enum: PhoneTypeList })
  public type: PhoneType

  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty()
  public phoneNumber: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public description?: string
}

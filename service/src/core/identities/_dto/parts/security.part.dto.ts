import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsArray, IsBoolean } from 'class-validator'

export class SecurityPartDTO {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  public oldPasswords?: string[]

  @IsString()
  @ApiProperty()
  public otpKey?: string

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  public u2fKey?: string[]

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  public allowedNetworks?: string[]

  @IsBoolean()
  @ApiProperty()
  public changePwdAtNextLogin: boolean

  @IsBoolean()
  @ApiProperty()
  public secretKey?: string
}

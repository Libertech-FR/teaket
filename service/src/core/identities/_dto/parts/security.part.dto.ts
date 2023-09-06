import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator'

export class SecurityPartDTO {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  public oldPasswords?: string[]

  @IsString()
  @IsOptional()
  @ApiProperty()
  public otpKey?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ type: [String] })
  public u2fKey?: string[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ type: [String] })
  public allowedNetworks?: string[]

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public changePwdAtNextLogin: boolean

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public secretKey?: string
}

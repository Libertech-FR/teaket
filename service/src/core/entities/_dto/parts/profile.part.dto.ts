import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { PhonePartDto } from '~/core/entities/_dto/parts/phone.part.dto'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class ProfilePartDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public commonName: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public firstName?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public lastName?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public thirdName?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public avatar?: string

  @ValidateNested({ each: true })
  @Type(() => PhonePartDto)
  @IsOptional()
  @ApiProperty({ type: [PhonePartDto] })
  public phones?: PhonePartDto[]
}

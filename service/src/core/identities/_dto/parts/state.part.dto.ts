import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsNumber, IsDate, IsOptional } from 'class-validator'

export class StatePartDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  public current: number

  @IsDate()
  @IsOptional()
  @ApiProperty()
  public lastChangedAt?: Date

  @IsDate()
  @IsOptional()
  @ApiProperty()
  public suspendedAt?: Date

  @IsDate()
  @IsOptional()
  @ApiProperty()
  public suspendedUntil?: Date

  @IsString()
  @IsOptional()
  @ApiProperty()
  public suspendedReason?: string
}

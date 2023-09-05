import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsNumber, IsDate } from 'class-validator'

export class StatePartDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  public current: number

  @IsDate()
  @ApiProperty()
  public lastChangedAt?: Date

  @IsDate()
  @ApiProperty()
  public suspendedAt?: Date

  @IsDate()
  @ApiProperty()
  public suspendedUntil?: Date

  @IsString()
  @ApiProperty()
  public suspendedReason?: string
}

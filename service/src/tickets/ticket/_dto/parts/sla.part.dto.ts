import { IsBoolean, IsDate, IsMongoId, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SlaPartDto {
  @IsMongoId()
  @IsOptional()
  @ApiProperty({ type: String })
  public id: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public name: string

  @IsDate()
  @IsOptional()
  @ApiProperty()
  public dueAt: Date

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public manual: boolean
}

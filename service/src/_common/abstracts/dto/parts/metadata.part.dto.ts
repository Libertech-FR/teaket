import { IsString, IsOptional, IsDate } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class MetadataPartDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  public createdBy?: string

  @IsDate()
  @IsOptional()
  @ApiProperty()
  public createdAt?: Date

  @IsString()
  @IsOptional()
  @ApiProperty()
  public lastUpdatedBy?: string

  @IsDate()
  @IsOptional()
  @ApiProperty()
  public lastUpdatedAt?: Date
}

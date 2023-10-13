import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class SearchMailsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty()
  public accounts?: string[]

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  public skip?: number

  @IsOptional()
  @IsNumber()
  @ApiProperty()
  public limit?: number
}

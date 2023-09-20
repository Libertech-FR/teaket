import { IsObject, IsOptional, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { MetadataPartDto } from './parts/metadata.part.dto'

export class MetadataDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataPartDto)
  @ApiProperty({ type: MetadataPartDto })
  public metadata?: MetadataPartDto
}

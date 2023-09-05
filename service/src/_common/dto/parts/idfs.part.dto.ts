import { IsMimeType, IsOptional, IsString } from 'class-validator'
import { IdnamePartDto } from '~/_common/dto/parts/idname.part.dto'
import { ApiProperty } from '@nestjs/swagger'

export class IdfsPartDto extends IdnamePartDto {
  @IsString()
  @ApiProperty()
  public namespace: string

  @IsString()
  @ApiProperty()
  public path: string

  @IsOptional()
  @IsString()
  @IsMimeType()
  @ApiProperty()
  public mime?: string
}

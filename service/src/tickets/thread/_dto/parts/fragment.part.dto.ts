import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { IdfsPartDto } from '~/_common/dto/parts/idfs.part.dto'
import { ApiProperty } from '@nestjs/swagger'
import { FragmentType, FragmentTypeList } from '~/tickets/thread/_enum/fragment-type.enum'

export class FragmentPartDto {
  @IsEnum(FragmentTypeList)
  @ApiProperty({ enum: FragmentTypeList })
  public disposition: FragmentType

  @IsOptional()
  @IsString()
  @ApiProperty()
  public message?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => IdfsPartDto)
  @ApiProperty({ type: IdfsPartDto })
  public filestorage?: object
}

import { IsEnum, IsOptional, IsString, ValidateNested, IsMongoId } from 'class-validator'
import { Type } from 'class-transformer'
import { IdfsPartDto } from '~/_common/dto/parts/idfs.part.dto'
import { ApiProperty } from '@nestjs/swagger'
import { FragmentType, FragmentTypeList } from '~/tickets/thread/_enum/fragment-type.enum'
import { Types } from 'mongoose'

export class FragmentPartDto {
  @IsMongoId()
  @ApiProperty({ type: String })
  public id: Types.ObjectId

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

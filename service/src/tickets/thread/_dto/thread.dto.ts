import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsArray, IsEnum, IsMongoId, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { FragmentPartDto } from '~/tickets/thread/_dto/parts/fragment.part.dto'
import { IdfsPartDto } from '~/_common/dto/parts/idfs.part.dto'
import { IdnamePartDto } from '~/_common/dto/parts/idname.part.dto'
import { ThreadType, ThreadTypeList } from '~/tickets/thread/_enum/thread-type.enum'
import { MetadataDto } from '~/_common/abstracts/dto/metadata.dto'

export class ThreadCreateDto extends MetadataDto {
  @IsMongoId()
  @ApiProperty()
  public ticketId: string

  @IsNumber()
  @IsEnum(ThreadTypeList)
  @ApiProperty({ enum: ThreadTypeList })
  public type: ThreadType

  @ValidateNested()
  @IsOptional()
  @Type(() => IdnamePartDto)
  @ApiProperty({ type: IdnamePartDto })
  public sourceRequest?: IdnamePartDto

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  public timeSpend?: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FragmentPartDto)
  @ApiProperty({ type: [FragmentPartDto] })
  public fragments: FragmentPartDto[]

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IdfsPartDto)
  @ApiProperty({ type: [IdfsPartDto] })
  public attachments?: IdfsPartDto[]
}

export class ThreadDto extends ThreadCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class ThreadUpdateDto extends PartialType(ThreadCreateDto) {}

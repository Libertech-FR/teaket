import { IsEnum, IsOptional, IsString, ValidateNested, IsMongoId, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { IdfsPartDto } from '~/_common/dto/parts/idfs.part.dto'
import { ApiProperty } from '@nestjs/swagger'
import { FragmentType, FragmentTypeList } from '~/tickets/thread/_enum/fragment-type.enum'
import { Types } from 'mongoose'
import { MailaddressPartDto } from '~/_common/dto/parts/mailaddress.part.dto'

export class MailinfoPartDto {
  @IsString()
  @ApiProperty()
  public subject: string

  @IsOptional()
  @Type(() => MailaddressPartDto)
  @ApiProperty({ type: MailaddressPartDto })
  public from?: MailaddressPartDto

  @IsOptional()
  @Type(() => MailaddressPartDto)
  @ApiProperty({ type: [MailaddressPartDto] })
  public to?: MailaddressPartDto[]

  /**
   * @description TheadType=INCOMING ONLY !
   */
  @IsString()
  @IsOptional()
  @ApiProperty()
  public messageId: string

  /**
   @description TheadType=INCOMING ONLY !
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => IdfsPartDto)
  @ApiProperty({ type: IdfsPartDto })
  public filestorage?: object
}

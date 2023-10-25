import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { IdfsPartDto } from '~/_common/dto/parts/idfs.part.dto'
import { ApiProperty } from '@nestjs/swagger'
import { MailaddressPartDto } from '~/_common/dto/parts/mailaddress.part.dto'

export class MailinfoPartDto {
  @IsString()
  @ApiProperty()
  public account: string

  @IsArray()
  @Type(() => MailaddressPartDto)
  @ApiProperty({ type: [MailaddressPartDto] })
  public to: MailaddressPartDto[]

  @IsString()
  @IsOptional()
  @ApiProperty()
  public subject?: string

  @IsOptional()
  @Type(() => MailaddressPartDto)
  @ApiProperty({ type: MailaddressPartDto })
  public from?: MailaddressPartDto

  @IsOptional()
  @Type(() => MailaddressPartDto)
  @ApiProperty({ type: [MailaddressPartDto] })
  public cc?: MailaddressPartDto[]

  @IsString()
  @IsOptional()
  @ApiProperty()
  public messageId: string

  @IsOptional()
  @ValidateNested()
  @Type(() => IdfsPartDto)
  @ApiProperty({ type: IdfsPartDto })
  public filestorage?: object
}

import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested, IsArray } from 'class-validator'
import { Type } from 'class-transformer'

export class CrontabsCreateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public description?: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  //TODO: validate cron expression
  public interval: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  @ApiProperty({ type: [Object] })
  public actions: { [key: string]: any }[] // eslint-disable-line

  @IsMongoId()
  @IsOptional()
  @ApiProperty({ type: String })
  public pluginId?: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public disabled?: boolean
}

export class CrontabsDto extends CrontabsCreateDto {
  @IsMongoId()
  @ApiProperty({ type: String })
  public _id: string
}

export class CrontabsUpdateDto extends PartialType(CrontabsCreateDto) {}

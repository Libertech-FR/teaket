import { IsString, IsOptional, IsBoolean, IsObject, IsMongoId } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class TriggersCreateDto {
  @IsString()
  @ApiProperty()
  public name: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  public description?: string

  @IsObject()
  @ApiProperty()
  public actions: { [key: string]: any }

  @IsOptional()
  @ApiProperty()
  public pluginId?: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public disabled?: boolean
}

export class TriggersDto extends TriggersCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class TriggersUpdateDto extends TriggersCreateDto {}

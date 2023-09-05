import { IsString, IsOptional, IsBoolean, IsObject, IsMongoId, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class TriggersCreateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  public description?: string

  @IsObject()
  @ApiProperty({ type: Object })
  public actions: { [key: string]: any }

  @IsMongoId()
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

export class TriggersUpdateDto extends TriggersCreateDto {
}

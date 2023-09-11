import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, IsNotEmpty, ValidateNested, IsEmail, IsBoolean, IsArray, IsMongoId, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { StatePartDTO } from './parts/state.part.dto'
import { SecurityPartDTO } from './parts/security.part.dto'
import { CustomFieldsDto } from '~/_common/abstracts/dto/custom-fields.dto'

export class IdentitiesCreateDto extends CustomFieldsDto {
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  public entityId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public username: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public displayName?: string

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  public email: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public password: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  public thirdPartyAuth?: string

  @ValidateNested()
  @Type(() => StatePartDTO)
  @IsNotEmpty()
  @ApiProperty({ type: StatePartDTO })
  public state: StatePartDTO

  @IsString()
  @IsOptional()
  @ApiProperty()
  public baseURL?: string

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  public roles: string[]

  @ValidateNested()
  @Type(() => SecurityPartDTO)
  @ApiProperty({ type: SecurityPartDTO })
  public security: SecurityPartDTO

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public hidden: boolean
}

export class IdentitiesDto extends IdentitiesCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class IdentitiesUpdateDto extends PartialType(IdentitiesCreateDto) {}

import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, IsNotEmpty, ValidateNested, IsEmail, IsBoolean, IsArray, IsMongoId } from 'class-validator'
import { Type } from 'class-transformer'
import { StatePartDTO } from './parts/state.part.dto'
import { SecurityPartDTO } from './parts/security.part.dto'
import { AbstractCustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'

export class IdentitiesCreateDto extends AbstractCustomFieldsDto {
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  public entityId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public username: string

  @IsString()
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
  @ApiProperty()
  public thirdPartyAuth?: string

  @ValidateNested()
  @Type(() => StatePartDTO)
  @IsNotEmpty()
  @ApiProperty()
  public state: StatePartDTO

  @IsString()
  @ApiProperty()
  public baseURL: string

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  public roles: string[]

  @ValidateNested()
  @Type(() => SecurityPartDTO)
  @ApiProperty()
  public security: SecurityPartDTO

  @IsBoolean()
  @ApiProperty()
  public hidden: boolean
}

export class IdentitiesDto extends IdentitiesCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class IdentitiesUpdateDto extends PartialType(IdentitiesCreateDto) {}

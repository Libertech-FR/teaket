import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CustomFieldsDto } from '~/_common/abstracts/dto/custom-fields.dto'
import { IsMongoId, IsString, IsEnum, IsOptional, IsObject, IsBoolean, IsNotEmpty, IsMimeType } from 'class-validator'
import { FsType, FsTypeList } from '~/core/filestorage/_enum/fs-type.enum'

export class FilestorageCreateDto extends CustomFieldsDto {
  @IsEnum(FsTypeList)
  @IsNotEmpty()
  @ApiProperty({ enum: FsTypeList })
  public type: FsType

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public namespace: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public path: string

  @IsOptional()
  @IsMongoId()
  @ApiProperty()
  public linkedTo?: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  public comments?: string

  @IsOptional()
  @IsMimeType()
  @ApiProperty()
  public mime?: string

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  public hidden?: boolean

  @IsOptional()
  @IsObject()
  @ApiProperty({ type: Object })
  public tags?: { [key: string]: any }

  @IsOptional()
  @IsObject()
  @ApiProperty({ type: Object })
  public acls?: { [key: string]: any }
}

export class FilestorageDto extends FilestorageCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class FilestorageUpdateDto extends PartialType(FilestorageCreateDto) {}

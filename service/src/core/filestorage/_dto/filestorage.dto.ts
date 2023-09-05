import { ApiProperty, PartialType } from '@nestjs/swagger'
import { AbstractCustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'
import { IsMongoId, IsString, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator'
import { FsType, FsTypeList } from '~/core/filestorage/_enum/fs-type.enum'

export class FilestorageCreateDto extends AbstractCustomFieldsDto {
  @IsEnum(FsTypeList)
  @ApiProperty({ enum: FsTypeList })
  type: FsType

  @IsString()
  @ApiProperty()
  namespace: string

  @IsString()
  @ApiProperty()
  path: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  comments?: string

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  hidden?: boolean

  @IsOptional()
  @IsObject()
  @ApiProperty()
  tags?: { [key: string]: any }

  @IsOptional()
  @IsObject()
  @ApiProperty()
  acls?: { [key: string]: any }
}

export class FilestorageDto extends FilestorageCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class FilestorageUpdateDto extends PartialType(FilestorageCreateDto) {
}

import { ApiProperty, PartialType } from '@nestjs/swagger'
import { AbstractCustomFieldsDto } from '~/_common/abstracts/dto/abstract.custom-fields.dto'
import { IsMongoId, IsString, IsEnum, IsOptional, IsObject, IsBoolean, IsNotEmpty } from 'class-validator'
import { FsType, FsTypeList } from '~/core/filestorage/_enum/fs-type.enum'

export class FilestorageCreateDto extends AbstractCustomFieldsDto {
  @IsEnum(FsTypeList)
  @IsNotEmpty()
  @ApiProperty({ enum: FsTypeList })
  type: FsType

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  namespace: string

  @IsString()
  @IsNotEmpty()
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
  @ApiProperty({ type: Object })
  tags?: { [key: string]: any }

  @IsOptional()
  @IsObject()
  @ApiProperty({ type: Object })
  acls?: { [key: string]: any }
}

export class FilestorageDto extends FilestorageCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string
}

export class FilestorageUpdateDto extends PartialType(FilestorageCreateDto) {
}

import { MixedValue } from './../../../_common/types/mixed-value.type'
import { Mixed } from 'mongoose'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, IsEnum, IsObject, ValidateNested, IsOptional, IsMongoId } from 'class-validator'
import { ObjectId } from 'mongodb'
import { MixedValue } from '~/_common/types/mixed-value.type'
import { FormTypeList, FormTypes } from '../_enum/types'
import { MetadataDto } from '~/_common/abstracts/dto/metadata.dto'
import { forwardRef } from '@nestjs/common'
import { Type } from 'class-transformer'
import { FormSectionDto } from './parts/section.dto'

export class FormCreateDto extends MetadataDto {
  @IsString()
  @ApiProperty()
  title: string

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string

  @IsEnum(FormTypeList)
  @ApiProperty({ enum: FormTypeList })
  type: FormTypes

  @IsObject()
  @IsOptional()
  @ApiProperty({ required: false })
  defaultValues: { [key: string]: MixedValue }

  @ValidateNested({ each: true })
  @Type(() => FormSectionDto)
  // @ApiProperty({ type: () => FormSectionDto, isArray: true })
  sections: { [key: string]: FormSectionDto }

  @IsString()
  @ApiProperty()
  submitButtonText: string

  @IsString()
  @ApiProperty()
  submitApiUrl: string

  @IsObject()
  @IsOptional()
  @ApiProperty({ required: false })
  redirectUrl?: string
}

export class FormDto extends FormCreateDto {}


export class FormUpdateDto extends PartialType(FormDto) {}

import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString, IsEnum, IsObject, ValidateNested, IsOptional, IsMongoId } from 'class-validator'
import { ObjectId } from 'mongodb'
import { MixedValue } from '~/_common/types/mixed-value.type'
import { MetadataDto } from '~/_common/abstracts/dto/metadata.dto'
import { forwardRef } from '@nestjs/common'
import { Type } from 'class-transformer'
import { FormFieldDto } from './field.dto'
import { FormTypes } from '../../_enum/types'

export class FormSectionDto {
  @IsString()
  @ApiProperty()
  label: string

  @IsEnum(FormTypes)
  @ApiProperty()
  type: FormTypes

  @IsObject()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => FormSectionDto)
  @ApiProperty({ type: () => FormSectionDto, required: false })
  sections?: { [sectionName: string]: FormSectionDto }

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  @ApiProperty({ type: FormFieldDto })
  fields: { [fieldName: string]: FormFieldDto }
}

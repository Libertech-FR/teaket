import { MetadataDto } from '~/_common/abstracts/dto/metadata.dto'
import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger'
import { IsArray, IsEnum, IsMongoId, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'
import { CustomFieldsDto } from '~/_common/abstracts/dto/custom-fields.dto'
import { Type } from 'class-transformer'
import { EnvelopePartDto } from '~/tickets/ticket/_dto/parts/envelope.part.dto'
import { TicketType, TicketTypeList } from '~/tickets/ticket/_enum/ticket-type.enum'
import { TagPartDto } from '~/tickets/ticket/_dto/parts/tag.part.dto'
import { TicketLifestep, TicketLifestepList } from '~/tickets/ticket/_enum/ticket-lifestep.enum'
import { IdnamePartDto } from '~/_common/dto/parts/idname.part.dto'
import { SlaPartDto } from '~/tickets/ticket/_dto/parts/sla.part.dto'

export class TicketCreateDto extends IntersectionType(CustomFieldsDto, MetadataDto) {
  @IsObject()
  @ValidateNested()
  @Type(() => EnvelopePartDto)
  @ApiProperty({ type: EnvelopePartDto })
  public envelope: EnvelopePartDto

  @IsString()
  @ApiProperty()
  public subject: string

  @IsEnum(TicketTypeList, { message: 'Type de ticket invalide' })
  @ApiProperty({ enum: TicketTypeList })
  public type: TicketType

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TagPartDto)
  @ApiProperty({ type: [TagPartDto] })
  public tags: TagPartDto[]

  @IsEnum(TicketLifestepList)
  @ApiProperty({ enum: TicketLifestepList })
  public lifestep: TicketLifestep

  @IsMongoId()
  @IsOptional()
  @ApiProperty()
  public parentId?: string

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => IdnamePartDto)
  @ApiProperty({ type: IdnamePartDto })
  public state?: IdnamePartDto

  @IsOptional()
  // @IsObject()
  @ValidateNested({ each: true })
  @Type(() => IdnamePartDto)
  @ApiProperty({ type: [IdnamePartDto] })
  public categories?: IdnamePartDto[]

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => IdnamePartDto)
  @ApiProperty({ type: IdnamePartDto })
  public project?: IdnamePartDto

  @IsObject()
  @ValidateNested()
  @Type(() => IdnamePartDto)
  @ApiProperty({ type: IdnamePartDto })
  public priority: IdnamePartDto

  @IsObject()
  @ValidateNested()
  @Type(() => IdnamePartDto)
  @ApiProperty({ type: IdnamePartDto })
  public impact: IdnamePartDto

  @IsObject()
  @ValidateNested()
  @Type(() => SlaPartDto)
  @ApiProperty({ type: SlaPartDto })
  public sla: SlaPartDto
}

export class TicketDto extends TicketCreateDto {
  @IsMongoId()
  @ApiProperty()
  public _id: string

  @IsString()
  @ApiProperty()
  public sequence: string

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  public readFlags: string[]

  @IsNumber()
  @ApiProperty()
  public totalTime: number
}

export class TicketUpdateDto extends PartialType(TicketCreateDto) {
}

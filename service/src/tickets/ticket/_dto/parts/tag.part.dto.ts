import { IdnamePartDto } from '~/_common/dto/parts/idname.part.dto'
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class TagPartDto {
  @IsMongoId({ message: 'ObjectId invalide' })
  @IsOptional()
  @ApiProperty({ type: String })
  public id: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public manual: boolean
}

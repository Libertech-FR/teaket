import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class TicketDto {
  @ApiProperty()
  public _id: string

  @ApiProperty()
  public subject: string
}

export class TicketCreateDto {
  @IsString()
  @ApiProperty()
  public subject: string
}

export class TicketUpdateDto extends PartialType(TicketCreateDto) {
}

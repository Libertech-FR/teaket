import { ApiProperty } from '@nestjs/swagger'
import { HttpStatus } from '@nestjs/common'

export class NotFoundDto {
  @ApiProperty({ enum: [HttpStatus.NOT_FOUND] })
  public statusCode: HttpStatus

  @ApiProperty()
  public message: string
}

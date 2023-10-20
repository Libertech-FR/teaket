import { ApiProperty } from '@nestjs/swagger'
import { HttpStatus } from '@nestjs/common'

export class ErrorSchemaDto {
  @ApiProperty({ enum: [HttpStatus.BAD_REQUEST] })
  public statusCode: HttpStatus

  @ApiProperty()
  public message: string

  @ApiProperty()
  public validations?: { [key: string]: string }[]

  @ApiProperty()
  // eslint-disable-next-line
  public _exception?: { [key: string]: any }
}

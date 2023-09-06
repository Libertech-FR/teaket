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
  public _exception?: { [key: string]: any }
}

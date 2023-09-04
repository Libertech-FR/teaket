import { ApiProperty } from '@nestjs/swagger'
import { HttpStatus } from '@nestjs/common'

export class PaginatedDto<TData = {}> {
  @ApiProperty()
  public statusCode: HttpStatus

  @ApiProperty()
  public total: number

  public data: TData[]
}

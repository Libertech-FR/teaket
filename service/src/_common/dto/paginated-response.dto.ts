import { ApiProperty } from '@nestjs/swagger'
import { HttpStatus } from '@nestjs/common'

export class PaginatedResponseDto<TData = NonNullable<unknown>> {
  @ApiProperty({ enum: [HttpStatus.OK] })
  public statusCode: HttpStatus

  @ApiProperty()
  public total: number

  @ApiProperty()
  public data: TData[]
}

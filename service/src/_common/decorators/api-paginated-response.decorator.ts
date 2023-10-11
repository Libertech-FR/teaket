import { applyDecorators, HttpStatus, Type } from '@nestjs/common'
import { ApiExtraModels, getSchemaPath } from '@nestjs/swagger'
import { ApiOkResponse, ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { PaginatedResponseDto } from '~/_common/dto/paginated-response.dto'

// eslint-disable-next-line
export const ApiPaginatedResponseDecorator = <TModel extends Type<any>>(
  model: TModel,
  options?: ApiResponseOptions | null | undefined,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              statusCode: {
                type: 'number',
                enum: [HttpStatus.OK],
              },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
      ...options,
    }),
  )
}

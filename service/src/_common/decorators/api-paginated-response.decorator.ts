import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiQuery, getSchemaPath } from '@nestjs/swagger'
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { PaginatedDto } from '~/_common/dto/paginated.dto'

const DEFAULT_OPTIONS = {
  queryPagination: true,
}

export interface ApiPaginatedResponseOptions {
  queryPagination?: boolean
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  options?: ApiPaginatedResponseOptions | null | undefined,
) => {
  options = { ...DEFAULT_OPTIONS, ...options }
  const extraDecorators = []
  if (options?.queryPagination) {
    extraDecorators.push(
      ApiQuery({ name: 'limit', type: Number, required: false }),
      ApiQuery({ name: 'skip', type: Number, required: false }),
    )
  }
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
    ...extraDecorators,
  )
}

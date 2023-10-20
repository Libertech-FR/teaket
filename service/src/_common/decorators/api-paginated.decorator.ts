import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiQuery, getSchemaPath } from '@nestjs/swagger'
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { ApiPaginatedResponseDecorator } from '~/_common/decorators/api-paginated-response.decorator'
import { PaginatedFilterDto } from '~/_common/dto/paginated-filter.dto'

export const ApiPaginatedDecorator = <TModel extends Type<any>>(model: TModel, options?: ApiResponseOptions | null | undefined) => {
  return applyDecorators(
    ApiQuery({ name: 'limit', type: Number, required: false }),
    ApiQuery({ name: 'skip', type: Number, required: false }),
    ApiExtraModels(PaginatedFilterDto),
    ApiQuery({
      required: false,
      name: 'filters',
      style: 'deepObject',
      explode: true,
      type: 'object',
      schema: {
        $ref: getSchemaPath(PaginatedFilterDto),
      },
    }),
    ApiPaginatedResponseDecorator(model, options),
  )
}

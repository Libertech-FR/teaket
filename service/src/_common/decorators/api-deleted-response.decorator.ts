import { applyDecorators, HttpStatus, Type } from '@nestjs/common'
import { ApiExtraModels, ApiNotFoundResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiOkResponse, ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { NotFoundDto } from '~/_common/dto/not-found.dto'

export const ApiDeletedResponseDecorator = <TModel extends Type<NonNullable<unknown>>>(
  model: TModel,
  responseOptions?: ApiResponseOptions | null | undefined,
  notFoundOptions?: ApiResponseOptions | null | undefined,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiExtraModels(NotFoundDto),
    ApiOkResponse({
      schema: {
        properties: {
          statusCode: {
            type: 'number',
            enum: [HttpStatus.OK],
          },
          data: {
            $ref: getSchemaPath(model),
          },
        },
      },
      ...responseOptions,
    }),
    ApiNotFoundResponse({
      description: 'Item not found',
      schema: {
        $ref: getSchemaPath(NotFoundDto),
      },
      ...notFoundOptions,
    }),
  )
}

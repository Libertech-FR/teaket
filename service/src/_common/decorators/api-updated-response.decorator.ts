import { applyDecorators, HttpStatus, Type } from '@nestjs/common'
import { ApiBadRequestResponse, ApiExtraModels, ApiNotFoundResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiOkResponse, ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { ErrorSchemaDto } from '~/_common/dto/error-schema.dto'
import { NotFoundDto } from '~/_common/dto/not-found.dto'

export const ApiUpdatedResponseDecorator = <TModel extends Type<any>>(
  model: TModel,
  responseOptions?: ApiResponseOptions | null | undefined,
  badRequestOptions?: ApiResponseOptions | null | undefined,
  notFoundOptions?: ApiResponseOptions | null | undefined,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiExtraModels(ErrorSchemaDto),
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
          }
        }
      },
      ...responseOptions,
    }),
    ApiBadRequestResponse({
      description: 'Schema validation failed',
      schema: {
        $ref: getSchemaPath(ErrorSchemaDto),
      },
      ...badRequestOptions,
    }),
    ApiNotFoundResponse({
      description: 'Item not found',
      schema: {
        $ref: getSchemaPath(NotFoundDto),
      },
      ...notFoundOptions,
    })
  )
}

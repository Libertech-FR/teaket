import { applyDecorators, HttpStatus, Type } from '@nestjs/common'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger'
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { ErrorSchemaDto } from '~/_common/dto/error-schema.dto'

export const ApiCreatedResponseDecorator = <TModel extends Type<any>>(
  model: TModel,
  options?: ApiResponseOptions | null | undefined,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiExtraModels(ErrorSchemaDto),
    ApiCreatedResponse({
      schema: {
        properties: {
          statusCode: {
            type: 'number',
            enum: [HttpStatus.CREATED],
          },
          data: {
            $ref: getSchemaPath(model),
          }
        }
      },
      ...options,
    }),
    ApiBadRequestResponse({
      description: 'Schema validation failed',
      schema: {
        $ref: getSchemaPath(ErrorSchemaDto),
      },
    }),
  )
}

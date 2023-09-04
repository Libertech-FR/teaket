import { applyDecorators, Type } from '@nestjs/common'
import { ApiBodyOptions } from '@nestjs/swagger'
import { ApiBodyDecorator } from '~/_common/decorators/api-body.decorator'
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { ApiUpdatedResponseDecorator } from '~/_common/decorators/api-updated-response.decorator'

export const ApiUpdateDecorator = <TModel extends Type<any>>(
  bodyModel: TModel,
  responseModel: TModel,
  bodyOptions?: ApiBodyOptions | null | undefined,
  responseOptions?: ApiResponseOptions | null | undefined,
) => {
  return applyDecorators(
    ApiBodyDecorator(bodyModel, bodyOptions),
    ApiUpdatedResponseDecorator(responseModel, responseOptions),
  )
}

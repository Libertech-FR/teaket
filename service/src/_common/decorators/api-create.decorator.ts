import { applyDecorators, Type } from '@nestjs/common'
import { ApiBodyOptions } from '@nestjs/swagger'
import { ApiBodyDecorator } from '~/_common/decorators/api-body.decorator'
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { ApiCreatedResponseDecorator } from '~/_common/decorators/api-created-response.decorator'

export const ApiCreateDecorator = <TModel extends Type<NonNullable<unknown>>>(
  bodyModel: TModel,
  responseModel: TModel,
  bodyOptions?: ApiBodyOptions | null | undefined,
  responseOptions?: ApiResponseOptions | null | undefined,
) => {
  return applyDecorators(ApiBodyDecorator(bodyModel, bodyOptions), ApiCreatedResponseDecorator(responseModel, responseOptions))
}

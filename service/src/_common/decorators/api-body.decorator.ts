import { applyDecorators, Type } from '@nestjs/common'
import { ApiBody, ApiBodyOptions, ApiExtraModels, getSchemaPath } from '@nestjs/swagger'

export const ApiBodyDecorator = <TModel extends Type<NonNullable<unknown>>>(model: TModel, options?: ApiBodyOptions | null | undefined) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiBody({
      schema: {
        $ref: getSchemaPath(model),
      },
      ...options,
    }),
  )
}

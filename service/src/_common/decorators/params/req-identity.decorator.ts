import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { IdentityType } from '~/_common/types/identity.type'

export const ReqIdentity = createParamDecorator((_data: unknown, ctx: ExecutionContext): IdentityType => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})

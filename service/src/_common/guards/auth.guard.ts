import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard as AuthGuardInternal } from '@nestjs/passport'
import { Observable } from 'rxjs'
import { META_UNPROTECTED } from '~/_common/decorators/public.decorator'

@Injectable()
export class AuthGuard extends AuthGuardInternal(['jwt']) {
  public constructor(private readonly reflector: Reflector) {
    super()
  }

  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isUnprotected = this.reflector.getAllAndOverride<boolean>(
      META_UNPROTECTED,
      [context.getClass(), context.getHandler()],
    )
    return isUnprotected || super.canActivate(context)
  }
}

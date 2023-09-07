import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '~/core/auth/auth.service'
import { Strategy } from 'passport-local'
import { Request } from 'express'
import { IdentityState } from '~/core/identities/_enum/identity-state.enum'
import { ExcludeIdentityType, IdentityType } from '~/_common/types/identity.type'
import { omit } from 'radash'


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly auth: AuthService) {
    super({
      passReqToCallback: true,
    })
  }

  public async validate(_: Request, username: string, password: string): Promise<IdentityType> {
    const user = await this.auth.authenticateWithLocal(username, password)
    if (!user) throw new UnauthorizedException()
    if (user.state.current !== IdentityState.ACTIVE) throw new ForbiddenException()
    return omit(user.toObject(), ExcludeIdentityType) as IdentityType
  }
}

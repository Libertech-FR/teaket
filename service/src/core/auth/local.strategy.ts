import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '~/core/auth/auth.service'
import { IVerifyOptions, Strategy } from 'passport-local'
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

  public async validate(
    _: Request,
    username: string,
    password: string,
    done: (error: any, user?: Express.User | false, options?: IVerifyOptions) => void,
  ): Promise<void> {
    Logger.debug(`Try to authenticate user : ${username}`, 'LocalStrategy')
    const user = await this.auth.authenticateWithLocal(username, password)
    if (!user) done(new UnauthorizedException(), false)
    if (user.state.current !== IdentityState.ACTIVE) done(new ForbiddenException(), false)
    done(null, omit(user.toObject(), ExcludeIdentityType) as IdentityType)
  }
}

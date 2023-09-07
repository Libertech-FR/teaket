import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { IdentityType } from '~/_common/types/identity.type'
import { JwtPayload } from 'jsonwebtoken'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {
    super({
      secretOrKey: config.get<string>('jwt.options.secret'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
    })
  }

  // noinspection JSUnusedGlobalSymbols
  public async validate(_: Request, payload: JwtPayload & { identity: IdentityType }, done: VerifiedCallback): Promise<void> {
    Logger.debug(`Atempt to authenticate with JTI: <${payload.jti}>`, 'JwtStrategy')
    if (!payload?.identity) return done(new UnauthorizedException(), false)
    const user = await this.auth.verifyIdentity(payload.jti)
    if (!user) return done(new ForbiddenException(), false)
    return done(null, payload?.identity)
  }
}

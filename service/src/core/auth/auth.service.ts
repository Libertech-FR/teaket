import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AbstractService } from '~/_common/abstracts/abstract.service'
import { JwtService } from '@nestjs/jwt'
import { ModuleRef } from '@nestjs/core'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { IdentitiesService } from '~/core/identities/identities.service'
import { Identities } from '~/core/identities/_schemas/identities.schema'
import { verify as argon2Verify } from 'argon2'
import { IdentityType } from '~/_common/types/identity.type'

@Injectable()
export class AuthService extends AbstractService {
  public constructor(
    protected moduleRef: ModuleRef,
    private readonly jwtService: JwtService,
    private readonly identityService: IdentitiesService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super()
  }

  public async authenticateWithLocal(username: string, password: string): Promise<Identities> {
    try {
      const user: any = await this.identityService.findOne({ username })
      if (user && await argon2Verify(user.password, password)) {
        return user
      }
    } catch (e) {
      return null
    }
  }

  public async verifyIdentity(jwtid: string): Promise<any> {
    try {
      const identity = await this.redis.get(`jwtid_${jwtid}`)
      if (identity) {
        return JSON.parse(identity)
      }
    } finally {
    }
    return null
  }

  public async createToken(identity: IdentityType, refresh_token?: string): Promise<{
    access_token: string,
    refresh_token: string
  }> {
    const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const jwtid = `${identity._id}_${random}`
    const access_token = this.jwtService.sign({ identity }, {
      expiresIn: '1h',
      jwtid,
    })
    if (!refresh_token) {
      refresh_token = '123'
    }
    await this.redis.set(`jwtid_${jwtid}`, JSON.stringify({ identity }), 'EX', 3600)
    return {
      access_token,
      refresh_token,
    }
  }

  public async clearSession(): Promise<void> {
    try {
      await this.redis.del('session')
    } finally {
    }
  }
}

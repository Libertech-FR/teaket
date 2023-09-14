// noinspection JSUnresolvedReference

import { ForbiddenException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { AbstractService } from '~/_common/abstracts/abstract.service'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { ModuleRef } from '@nestjs/core'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { IdentitiesService } from '~/core/identities/identities.service'
import { Identities } from '~/core/identities/_schemas/identities.schema'
import { verify as argon2Verify } from 'argon2'
import { IdentityType } from '~/_common/types/identity.type'
import { randomBytes } from 'crypto'
import { omit } from 'radash'
import { JwtPayload } from 'jsonwebtoken'
import { EntitiesService } from '~/core/entities/entities.service'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import * as process from 'process'
import { ConsoleSession } from '~/_common/data/console-session'

@Injectable()
export class AuthService extends AbstractService implements OnModuleInit {
  protected readonly DEV_TOKEN_PATH = '.dev-token.json'
  protected readonly TOKEN_PATH_SEPARATOR = ':'

  protected readonly ACCESS_TOKEN_PREFIX = 'access_token'
  protected readonly REFRESH_TOKEN_PREFIX = 'refresh_token'

  protected ACCESS_TOKEN_EXPIRES_IN = 5 * 60
  protected REFRESH_TOKEN_EXPIRES_IN = 3600 * 24 * 7
  //TODO: get data expire from config

  public constructor(
    protected moduleRef: ModuleRef,
    private readonly jwtService: JwtService,
    private readonly identityService: IdentitiesService,
    private readonly entityService: EntitiesService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super()
  }

  public async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.warn('DEV MODE ENABLED !')
      const devTokenPath = resolve(process.cwd(), this.DEV_TOKEN_PATH)
      if (existsSync(devTokenPath)) {
        try {
          const data = JSON.parse(readFileSync(devTokenPath, 'utf-8'))
          if (data.access_token) {
            this.logger.log(`TOKEN ALREADY EXIST : <${data.access_token}>`)
            return
          }
        } catch (e) {
          this.logger.error(`TOKEN FILE CORRUPTED ! REGENERATING...`)
        }
      }
      const { access_token } = await this.createTokens(new ConsoleSession(), false, {
        expiresIn: '1y',
      })
      writeFileSync(devTokenPath, JSON.stringify({
        access_token,
      }))

      this.logger.log(`NEW TOKEN CREATED : <${access_token}>`)
    }
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

  public async verifyIdentity(payload: JwtPayload & { identity: IdentityType }): Promise<any> {
    try {
      if (payload.scopes.includes('offline')) {
        return payload.identity
      }
      const identity = await this.redis.get([this.ACCESS_TOKEN_PREFIX, payload.jti].join(':'))
      if (identity) {
        return JSON.parse(identity)
      }
    } finally {
    }
    return null
  }

  public async createTokens(identity: IdentityType, refresh_token?: string | false, options?: JwtSignOptions): Promise<{
    access_token: string,
    refresh_token?: string
  }> {
    const scopes = ['teaket']
    if (refresh_token === false) scopes.push('offline')
    const jwtid = `${identity._id}_${randomBytes(16).toString('hex')}`
    const access_token = this.jwtService.sign({ identity, scopes }, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      jwtid,
      subject: `${identity._id}`,
      ...options,
    })
    if (refresh_token === false) return { access_token }
    if (!refresh_token) {
      refresh_token = [`${identity._id}`, randomBytes(64).toString('hex')].join(this.TOKEN_PATH_SEPARATOR)
      await this.redis.set([this.REFRESH_TOKEN_PREFIX, refresh_token].join(this.TOKEN_PATH_SEPARATOR), JSON.stringify({
        identityId: identity._id,
      }))
    }
    await this.redis.expire([this.REFRESH_TOKEN_PREFIX, refresh_token].join(this.TOKEN_PATH_SEPARATOR), this.REFRESH_TOKEN_EXPIRES_IN)
    await this.redis.set([this.ACCESS_TOKEN_PREFIX, jwtid].join(this.TOKEN_PATH_SEPARATOR), JSON.stringify({
      identity,
      refresh_token,
    }), 'EX', this.ACCESS_TOKEN_EXPIRES_IN)
    return {
      access_token,
      refresh_token,
    }
  }

  public async getSessionData(identity: IdentityType): Promise<any> {
    const entity = await this.entityService.findOne({ _id: identity.entityId }, {
      projection: {
        metadata: 0,
      },
    })
    return {
      ...identity,
      entity,
    }
  }

  public async renewTokens(refresh_token: string): Promise<{
    access_token: string,
    refresh_token?: string
  }> {
    const data = await this.redis.get([this.REFRESH_TOKEN_PREFIX, refresh_token].join(this.TOKEN_PATH_SEPARATOR))
    if (!data) throw new UnauthorizedException()
    const { identityId } = JSON.parse(data)
    const identity = await this.identityService.findOne({ _id: identityId })
    if (!identity) throw new ForbiddenException()
    return this.createTokens(omit(identity.toObject(), ['password']), refresh_token)
  }

  public async clearSession(jwt: string): Promise<void> {
    try {
      const data = this.jwtService.decode(jwt) as JwtPayload
      if (!data) return null
      const { jti } = data
      const infos = await this.redis.get([this.ACCESS_TOKEN_PREFIX, jti].join(this.TOKEN_PATH_SEPARATOR))
      await this.redis.del([this.ACCESS_TOKEN_PREFIX, jti].join(this.TOKEN_PATH_SEPARATOR))
      if (infos) {
        const { refresh_token } = JSON.parse(infos)
        await this.redis.del([this.REFRESH_TOKEN_PREFIX, refresh_token].join(this.TOKEN_PATH_SEPARATOR))
      }
    } finally {
    }
  }
}

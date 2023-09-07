import { Controller, Get, HttpStatus, Post, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { Response } from 'express'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '~/_common/decorators/public.decorator'
import { ModuleRef } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IdentityType } from '~/_common/types/identity.type'
import { ReqIdentity } from '~/_common/decorators/params/req-identity.decorator'

@Public()
@ApiTags('core')
@Controller('auth')
export class AuthController extends AbstractController {
  constructor(
    protected moduleRef: ModuleRef,
    private readonly service: AuthService,
  ) {
    super()
  }

  @Post('local')
  @UseGuards(AuthGuard('local'))
  public async authenticateWithLocal(@Res() res: Response, @ReqIdentity() identity: IdentityType): Promise<Response> {
    const tokens = await this.service.createToken(identity)
    return res.status(HttpStatus.CREATED).json({
      ...tokens,
      token: '1234',
      identity,
      user: {
        id: 1,
      }
    })
  }

  @Get('session')
  // @UseGuards(AuthGuard('jwt'))
  public async session(@Res() res: Response, @ReqIdentity() identity: IdentityType): Promise<Response> {
    // const tokens = await this.service.createToken(identity)
    return res.status(HttpStatus.OK).json({
      // ...tokens,
      token: '1234',
      identity,
      user: {
        id: 1,
      }
    })
  }

  @Post('logout')
  public async logout(@Res() res: Response): Promise<Response> {
    return res.status(HttpStatus.NO_CONTENT).send()
  }
}

import { Body, Controller, Get, Header, Headers, HttpStatus, Post, Res, UseGuards } from '@nestjs/common'
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
  public async authenticateWithLocal(@Res() res: Response, @ReqIdentity() user: IdentityType): Promise<Response> {
    const tokens = await this.service.createTokens(user)
    return res.status(HttpStatus.OK).json({
      ...tokens,
      user,
    })
  }

  @Get('session')
  @UseGuards(AuthGuard('jwt'))
  public async session(@Res() res: Response, @ReqIdentity() identity: IdentityType): Promise<Response> {
    const user = await this.service.getSessionData(identity)
    return res.status(HttpStatus.OK).json({
      user,
    })
  }

  @Post('refresh')
  public async refresh(@Res() res: Response, @Body() body: any): Promise<Response> {
    const tokens = await this.service.renewTokens(body.refresh_token)
    return res.status(HttpStatus.OK).json({
      ...tokens,
    })
  }

  @Post('logout')
  public async logout(@Res() res: Response, @Headers('Authorization') jwt: string): Promise<Response> {
    await this.service.clearSession(jwt.replace(/^Bearer\s/, ''))
    return res.status(HttpStatus.OK).send()
  }
}

import { Body, Controller, Get, Headers, HttpStatus, Post, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { Response } from 'express'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '~/_common/decorators/public.decorator'
import { ModuleRef } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IdentityType } from '~/_common/types/identity.type'
import { ReqIdentity } from '~/_common/decorators/params/req-identity.decorator'
import { SettingsService } from '~/core/settings/settings.service'
import { SettingFor } from '~/core/settings/_enum/setting-for.enum'

@Public()
@ApiTags('core')
@Controller('auth')
export class AuthController extends AbstractController {
  constructor(protected moduleRef: ModuleRef, private readonly service: AuthService, private readonly settings: SettingsService) {
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
    const settings = await this.settings.settings([SettingFor.USER, SettingFor.ROLE], identity)
    return res.status(HttpStatus.OK).json({
      user: {
        ...user,
        settings,
      },
    })
  }

  //TODO: change any
  @Post('refresh')
  public async refresh(@Res() res: Response, @Body() body: { refresh_token: string }): Promise<Response> {
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

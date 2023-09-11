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
  public async authenticateWithLocal(@Res() res: Response, @ReqIdentity() user: IdentityType): Promise<Response> {
    const tokens = await this.service.createToken(user)
    return res.status(HttpStatus.OK).json({
      ...tokens,
      user,
    })
  }

  @Get('session')
  @UseGuards(AuthGuard('jwt'))
  public async session(@Res() res: Response, @ReqIdentity() user: IdentityType): Promise<Response> {
    const tokens = await this.service.createToken(user)
    return res.status(HttpStatus.OK).json({
      ...tokens,
      user,
    })
  }

  @Post('logout')
  public async logout(@Res() res: Response): Promise<Response> {
    return res.status(HttpStatus.OK).send()
  }
}

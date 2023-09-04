import { Controller, Get, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { Response } from 'express'

@Controller('auth')
export class AuthController extends AbstractController {
  constructor(private readonly service: AuthService) {
    super()
  }

  @Post('login')
  public async login(@Res() res: Response): Promise<Response> {
    console.log('login')
    return res.json({
      token: '123',
      user: {
        id: "1",
      }
    })
  }

  @Get('session')
  public async session(@Res() res: Response): Promise<Response> {
    console.log('session')
    return res.json({
      token: '1234',
      user: {
        id: "1",
      }
    })
  }

  @Get('credentials')
  public async credentials(@Res() res: Response): Promise<Response> {
    return res.json({
      token: '123',
      user: {
        id: "1",
      }
    })
  }
}

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { json } from 'body-parser'
import { Response } from 'express'
import { join } from 'path'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import * as passport from 'passport'
import { ShutdownService } from '~/shutdown.service'
import * as process from 'process'

declare const module: any
;(async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  })
  app.get(ShutdownService).subscribeToShutdown(async () => {
    await app.close()
    process.exit(0)
  })
  app.use((_: any, res: Response, next: () => void) => {
    res.removeHeader('x-powered-by')
    next()
  })
  app.use(passport.initialize())
  app.use(cookieParser())
  app.use(json({ limit: '50mb' }))
  app.useStaticAssets(join(__dirname, 'public'))
  app.setBaseViewsDir(join(__dirname, 'templates'))
  if (process.env.production !== 'production') {
    require('./swagger').default(app)
  }
  await app.listen(7100, async (): Promise<void> => {
    Logger.log('@libertech-fr/teaket is READY on <http://0.0.0.0:7100/> !', 'Bootstrap')
  })
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose((): Promise<void> => app.close())
  }
})()

// noinspection JSUnresolvedReference,JSIgnoredPromiseFromCall

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Response } from 'express'
import { join } from 'path'
import { AppModule } from './app.module'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { ShutdownService } from '~/shutdown.service'
import process from 'process'
import { rawBodyBuffer } from '~/_common/middlewares/raw-body-buffer.middleware'
import config from '~/config'
import { AppClusterService } from '~/app.cluster.service'

// eslint-disable-next-line
declare const module: any
AppClusterService.clusterize(async (): Promise<void> => {
  const cfg = config()
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    // snapshot: true,
    // logger: false,
    bodyParser: false,
    rawBody: true,
  })
  // app.useLogger(['error', 'warn', 'log', 'debug', 'verbose'])
  app.get(ShutdownService).subscribeToShutdown(async () => {
    await app.close()
    process.exit(0)
  })
  // eslint-disable-next-line
  app.use((_: any, res: Response, next: () => void) => {
    res.removeHeader('x-powered-by')
    next()
  })
  app.setViewEngine('hbs')
  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.use(passport.initialize())
  app.use(rawBodyBuffer(cfg?.application?.bodyParser))
  app.use(cookieParser())
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
})

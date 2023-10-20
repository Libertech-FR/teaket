import { CallHandler, ExecutionContext, Inject, mixin, NestInterceptor, Optional, Type } from '@nestjs/common'
import { Observable } from 'rxjs'
import multer from 'multer'
import { MULTER_MODULE_OPTIONS } from '@nestjs/platform-express/multer/files.constants'
import { MulterModuleOptions } from '@nestjs/platform-express'
import { transformException } from '@nestjs/platform-express/multer/multer/multer.utils'
import { Request } from 'express'

// eslint-disable-next-line
export function FileRawBodyInterceptor(fieldName: string, localOptions?: any): Type<NestInterceptor> {
  class MixinInterceptor implements NestInterceptor {
    // eslint-disable-next-line
    protected multer: any

    public constructor(
      @Optional()
      @Inject(MULTER_MODULE_OPTIONS)
      options: MulterModuleOptions = {},
    ) {
      // eslint-disable-next-line
      this.multer = (multer as any)({
        ...options,
        ...localOptions,
      })
    }

    // eslint-disable-next-line
    public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const ctx = context.switchToHttp()
      await new Promise<void>((resolve, reject) => {
        const request = ctx.getRequest<Request & { rawBody: string }>()
        request.rawBody = ''
        request.prependListener('data', (chunk) => (request.rawBody += chunk.toString()))
        // eslint-disable-next-line
        this.multer.single(fieldName)(request, ctx.getResponse(), (err: any) => {
          if (err) {
            const error = transformException(err)
            return reject(error)
          }
          resolve()
        })
      })
      return next.handle()
    }
  }
  return mixin(MixinInterceptor)
}

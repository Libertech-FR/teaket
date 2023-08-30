import { ModuleRef } from '@nestjs/core'

export interface AbstractControllerContext {
  [key: string | number]: any

  moduleRef?: ModuleRef
}

export abstract class AbstractController {
  protected moduleRef?: ModuleRef

  public constructor(context?: AbstractControllerContext) {
    this.moduleRef = context?.moduleRef
  }

  public get controllerName(): string {
    return this.constructor.name.replace(/Controller$/, '')
  }
}

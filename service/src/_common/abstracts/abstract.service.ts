import { Injectable, Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Request } from 'express'
import { EventEmitter2 } from '@nestjs/event-emitter'

export interface AbstractServiceContext {
  [key: string | number]: any // eslint-disable-line @typescript-eslint/no-explicit-any

  moduleRef?: ModuleRef
  request?: Request & { user?: Express.User }
  eventEmitter?: EventEmitter2
}

@Injectable()
export abstract class AbstractService {
  protected logger: Logger
  protected moduleRef: ModuleRef
  protected request?: Request & { user?: Express.User & any } // eslint-disable-line
  protected eventEmitter?: EventEmitter2

  protected constructor(context?: AbstractServiceContext) {
    this.moduleRef = context?.moduleRef
    this.request = context?.request
    this.logger = new Logger(this.serviceName)
    if (context?.eventEmitter) {
      if (!context?.request) throw new Error('Request is not defined in ' + this.serviceName)
    }
  }

  public get moduleName(): string {
    //TODO: change modulename from module ref ?
    if (!this.request) throw new Error('Request is not defined in ' + this.constructor.name)
    const moduleName = this.request.path.split('/').slice(1).shift()
    return moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
  }

  public get serviceName(): string {
    return this.constructor.name.replace(/Service$/, '')
  }
}

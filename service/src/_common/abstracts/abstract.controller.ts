import { ModuleRef } from '@nestjs/core'
import { ApiExtraModels } from '@nestjs/swagger'
import { PaginatedResponseDto } from '~/_common/dto/paginated-response.dto'
import { Logger } from '@nestjs/common'

export interface AbstractControllerContext {
  [key: string | number]: any

  moduleRef?: ModuleRef
}

@ApiExtraModels(PaginatedResponseDto)
export abstract class AbstractController {
  protected logger: Logger
  protected moduleRef?: ModuleRef

  protected constructor(context?: AbstractControllerContext) {
    this.moduleRef = context?.moduleRef
    this.logger = new Logger(this.controllerName)
  }

  public get controllerName(): string {
    return this.constructor.name.replace(/Controller$/, '')
  }
}

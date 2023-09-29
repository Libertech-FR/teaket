import { Inject, Injectable, Scope } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Project } from './_schemas/project.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'
import { ModuleRef, REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable({ scope: Scope.REQUEST })
export class ProjectService extends AbstractServiceSchema {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectModel(Project.name) protected _model: Model<Project>,
    @Inject(REQUEST) protected request?: Request & { user?: Express.User },
  ) {
    super({ moduleRef, request })
  }
}

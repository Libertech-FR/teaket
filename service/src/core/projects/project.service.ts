import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Project } from './_schemas/project.schema'
import { Model } from 'mongoose'
import { AbstractServiceSchema } from '~/_common/abstracts/abstract.service.schema'

@Injectable()
export class ProjectService extends AbstractServiceSchema {
  constructor(@InjectModel(Project.name) protected _model: Model<Project>) {
    super()
  }
}

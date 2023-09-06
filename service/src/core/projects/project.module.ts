import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProjectSchema, Project } from './_schemas/project.schema'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Project.name,
        useFactory: () => ProjectSchema,
      },
    ]),
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}

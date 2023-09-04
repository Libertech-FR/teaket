import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SourceRequestSchema, SourceRequest } from '~/tickets/source-request/_schemas/source-request.schema'
import { SourceRequestService } from './source-request.service'
import { SourceRequestController } from './source-request.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: SourceRequest.name,
        useFactory: () => SourceRequestSchema,
      },
    ]),
  ],
  providers: [SourceRequestService],
  controllers: [SourceRequestController],
})
export class SourceRequestModule {}

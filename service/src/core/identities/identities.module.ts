import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { IdentitiesSchema, Identities } from '~/core/identities/_schemas/identities.schema'
import { IdentitiesService } from './identities.service'
import { IdentitiesController } from './identities.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Identities.name,
        useFactory: () => IdentitiesSchema,
      },
    ]),
  ],
  providers: [IdentitiesService],
  controllers: [IdentitiesController],
})
export class IdentitiesModule {}

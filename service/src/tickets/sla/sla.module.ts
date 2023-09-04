import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SlaSchema, Sla } from '~/tickets/sla/_schemas/sla.schema'
import { SlaService } from './sla.service'
import { SlaController } from './sla.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Sla.name,
        useFactory: () => SlaSchema,
      },
    ]),
  ],
  providers: [SlaService],
  controllers: [SlaController],
})
export class SlaModule {}

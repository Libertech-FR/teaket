import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { StateService } from './state.service'
import { StateController } from './state.controller'
import { State, StateSchema } from '~/tickets/state/_schemas/state.schema'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: State.name,
        useFactory: () => StateSchema,
      },
    ]),
  ],
  providers: [StateService],
  controllers: [StateController],
})
export class StateModule {}

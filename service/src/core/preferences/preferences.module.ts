import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PreferencesSchema, Preferences } from './_schemas/preferences.schema'
import { PreferencesService } from './preferences.service'
import { PreferencesController } from './preferences.controller'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Preferences.name,
        useFactory: () => PreferencesSchema,
      },
    ]),
  ],
  providers: [PreferencesService],
  controllers: [PreferencesController],
})
export class PreferencesModule {}

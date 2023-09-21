import { DynamicModule, Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SettingsService } from '~/core/settings/settings.service'
import { Setting, SettingSchema } from '~/core/settings/_schemas/setting.schema'

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Setting.name,
        useFactory: () => SettingSchema,
      },
    ]),
  ],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {
  public static forRoot(): DynamicModule {
    return {
      module: this,
    }
  }
}

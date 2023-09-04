import { DynamicModule, Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import { CoreService } from '~/core/core.service'
import { CoreController } from '~/core/core.controller'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { CategoriesModule } from './categories/categories.module'
import { ProjectModule } from './projects/project.module'
import { TriggersModule } from './triggers/triggers.module';
import { CrontabsModule } from './crontabs/crontabs.module';
import { PreferencesModule } from './preferences/preferences.module';

@Module({
  imports: [AuthModule, UsersModule, CategoriesModule, ProjectModule, TriggersModule, CrontabsModule, PreferencesModule],
  providers: [CoreService],
  controllers: [CoreController],
})
export class CoreModule {
  public static register(): DynamicModule {
    return {
      module: this,
      imports: [
        RouterModule.register([
          {
            path: 'core',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ]),
      ],
    }
  }
}

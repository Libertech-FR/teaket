import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import serviceSetup from '~/extensions/extensions.service.setup'
import * as process from 'process'

@Module({
  imports: [],
})
export class ExtensionsModule implements OnModuleInit {
  public async onModuleInit(): Promise<void> {
    Logger.log('All extensions is initialized', 'ExtensionsModule')
  }

  public static async register(): Promise<DynamicModule> {
    Logger.debug('Registering extensions', 'ExtensionsModule')
    const modules = await serviceSetup()
    return {
      module: this,
      imports: [
        ...modules,
        RouterModule.register([
          {
            path: 'extensions',
            children: [...Reflect.getMetadata('imports', this)],
          },
        ]),
      ],
    }
  }
}

import { Injectable } from '@nestjs/common'
import { PackageJson } from 'types-package-json'
import { AbstractService } from './_common/abstracts/abstract.service'
import { readFileSync } from 'fs'
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class AppService extends AbstractService {
  private readonly package: Partial<PackageJson>

  public constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef)
    this.package = JSON.parse(readFileSync('package.json', 'utf-8'))
  }

  public getInfos(): Partial<PackageJson> {
    return {
      name: this.package.name,
      version: this.package.version,
    }
  }
}

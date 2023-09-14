import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { parse } from 'yaml'
import { ExtensionFileV1, ExtensionsFileV1, ExtensionsListV1 } from './_dto/extension.dto'
import { plainToInstance } from 'class-transformer'
import { validateOrReject } from 'class-validator'
import * as process from 'process'
import { DynamicModule, Logger } from '@nestjs/common'

const serviceList: DynamicModule[] = []

export const EXTENSION_FILE_INFO = 'extension.yml'
export const EXTENSIONS_FILE_PATH = join(dirname(process.cwd()), '/extensions.yml')

export async function parseExtensionsList(): Promise<ExtensionsListV1[]> {
  const data = readFileSync(EXTENSIONS_FILE_PATH, 'utf8')
  const yml = parse(data)
  const schema = plainToInstance(ExtensionsFileV1, yml)
  try {
    await validateOrReject(schema, {
      whitelist: true,
    })
  } catch (errors) {
    const err = new Error(`Invalid extensions`)
    err.message = errors.map((e) => e.toString()).join(', ') //TODO: improve error message
    throw err
  }

  return yml.list
}

export async function extensionParseFile(path: string): Promise<ExtensionFileV1> {
  Logger.log('Extension file found, validating...', 'extensionParseFile')
  const data = readFileSync(`${path}/${EXTENSION_FILE_INFO}`, 'utf8')
  const yml = parse(data)
  return plainToInstance(ExtensionFileV1, yml)
}

export default async function(): Promise<DynamicModule[]> {
  try {
    if (existsSync(EXTENSIONS_FILE_PATH)) {
      Logger.log('Extensions file found, validating...', 'parsingAppExtensions')
      const list = await parseExtensionsList()
      for (const extension of list) {
        if (!extension.enabled) {
          Logger.log(`Extension ${extension.path} is disabled`, 'ExtensionServiceSetup')
          continue
        }
        const extensionPath = `${dirname(process.cwd())}/${extension.path}`
        const extensionFile = await extensionParseFile(extensionPath)
        if (!extensionFile.settings.service.target) {
          Logger.warn(`Extension ${extensionFile.information.name} has no service target`, 'ExtensionServiceSetup')
          continue
        }
        const extensionServiceTarget = `${extensionPath}/${extensionFile.settings.service.target}`
        await import(extensionServiceTarget).then((module) => {
          if (module[extensionFile.settings.service.mainModule]) {
            serviceList.push(module[extensionFile.settings.service.mainModule])
            Logger.log(`Extension ${extensionFile.information.name} is enabled`, 'ExtensionServiceSetup')
            return
          }
          Logger.warn(`Extension ${extensionFile.information.name} has no main module`, 'ExtensionServiceSetup')
        }).catch((err) => {
          Logger.error(`Extension ${extensionFile.information.name} failed to load`, 'ExtensionServiceSetup')
          console.error(err)
        })
      }
    }
    return serviceList
  } catch (err) {
    Logger.error('Failed to load extensions', 'ExtensionServiceSetup')
    console.error(err)
    process.exit(1)
  }
}

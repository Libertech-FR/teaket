import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { parse } from 'yaml'
import { ExtensionFileV1, ExtensionsFileV1, ExtensionsListV1 } from './extension.dto'
import { plainToInstance } from 'class-transformer'
import { validateOrReject } from 'class-validator'

const appList: string[] = []
const serviceList: any[] = [] // TODO: module type

export const EXTENSION_FILE_INFO = 'extension.yml'
export const EXTENSIONS_FILE_PATH = join(dirname(dirname(__dirname)), '/extensions.yml')

export async function parseExtensionsList(): Promise<ExtensionsFileV1[]> {
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
  console.log('Extension file found, validating...', 'extensionParseFile') //TODO: universal logger
  const data = readFileSync(`${path}/${EXTENSION_FILE_INFO}`, 'utf8')
  const yml = parse(data)
  return plainToInstance(ExtensionFileV1, yml)
}

// export function app(): string[] {
//   try {
//     if (existsSync(EXTENSIONS_FILE_PATH)) {
//       console.log('Extensions file found, validating...', 'parsingAppExtensions') //TODO: universal logger
//       const list = parseExtensionsList()
//       for (const extension of list) {
//         if (extension.enabled) {
//           const extensionPath = `${dirname(dirname(__dirname))}/${extension.path}`
//           const extensionFile = extensionParseFile(extensionPath)
//           if (extensionFile.settings.app.target) {
//             const extensionAppTarget = `${extensionPath}/${extensionFile.settings.app.target}`
//             appList.push(process.env.NODE_ENV === 'development' ? `${extensionAppTarget}/src/module` : `${extensionAppTarget}/dist/module.cjs`) // TODO: target dev and prod parameters
//           }
//         }
//       }
//     }
//     return appList
//   } catch (err) {
//     console.error(err) //TODO: universal logger
//     process.exit(1)
//   }
// }

export async function service(): Promise<any[]> {
  try {
    if (existsSync(EXTENSIONS_FILE_PATH)) {
      console.log('Extensions file found, validating...', 'parsingAppExtensions') //TODO: universal logger
      const list = await parseExtensionsList()
      for (const extension of list) {
        if (extension.enabled) {
          const extensionPath = `${dirname(dirname(__dirname))}/${extension.path}`
          const extensionFile = await extensionParseFile(extensionPath)
          if (extensionFile.settings.service.target) {
            // const extensionServiceTarget = `${extensionPath}/${extensionFile.settings.service.target}`
            // serviceList.push() // TODO: target dev and prod parameters
          }
        }
      }
    }
    return serviceList
  } catch (err) {
    console.error(err) //TODO: universal logger
    process.exit(1)
  }
}

import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { parse } from 'yaml'

const appList: string[] = []

export const EXTENSION_FILE_INFO = 'extension.yml'
export const EXTENSIONS_FILE_PATH = join(dirname(dirname(__dirname)), '/extensions.yml')

export function parseExtensionsList(): any[] {
  const data = readFileSync(EXTENSIONS_FILE_PATH, 'utf8')
  const yml = parse(data)
  return yml.list
}

export function extensionParseFile(path: string): any {
  const data = readFileSync(`${path}/${EXTENSION_FILE_INFO}`, 'utf8')
  return parse(data)
}

// noinspection JSUnusedGlobalSymbols
export default function (): string[] {
  try {
    if (existsSync(EXTENSIONS_FILE_PATH)) {
      const list = parseExtensionsList()
      for (const extension of list) {
        if (extension.enabled) {
          const extensionPath = `${dirname(dirname(__dirname))}/${extension.path}`
          const extensionFile = extensionParseFile(extensionPath)
          if (extensionFile.settings.app.target) {
            const extensionAppTarget = `${extensionPath}/${extensionFile.settings.app.target}`
            appList.push(process.env.NODE_ENV === 'development' ? `${extensionAppTarget}/src/module` : `${extensionAppTarget}/dist/module.cjs`) // TODO: target dev and prod parameters
          }
        }
      }
    }
    return appList
  } catch (err) {
    console.error(err) //TODO: universal logger
    process.exit(1)
  }
}

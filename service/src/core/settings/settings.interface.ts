import { Types } from 'mongoose'

export type MixedSettingValue = string | Types.ObjectId | Date | number | boolean | null | object

export interface SettingsDefaults {
  [key: string]: SettingsDefaults | MixedSettingValue
}

export interface Settings extends SettingsDefaults {
  tickets: {
    ticket: {
      schema: {
        sequence: {
          prefix: string
          suffix: string
          length: number
        }
      }
    }
  }
}

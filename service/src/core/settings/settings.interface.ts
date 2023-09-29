import { MixedValue } from '~/_common/types/mixed-value.type'

export interface SettingsDefaults {
  [key: string]: SettingsDefaults | MixedValue
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

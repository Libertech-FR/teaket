import { MixedValue } from '~/_common/types/mixed-value.type'
import { MailsSettingsInterface } from '~/tickets/mails/_interfaces/mails-settings.interface'
import { SettingFor } from '~/core/settings/_enum/setting-for.enum'

export interface SettingsDefaults {
  [key: string]: SettingsDefaults | MixedValue
}

export interface SettingsGetOptions<T = MixedValue> {
  for?: SettingFor | SettingFor[]
  scope?: string
  callback?: (value: T) => T | Promise<T>
}

export interface Settings extends SettingsDefaults {
  tickets?: {
    mails?: {
      mailrest?: MailsSettingsInterface
    }
    ticket?: {
      schema?: {
        sequence?: {
          prefix?: string
          suffix?: string
          length?: number
        }
      }
    }
  }
}

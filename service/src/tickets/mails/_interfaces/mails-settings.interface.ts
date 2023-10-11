export interface MailsSettingsInterface {
  url: string
  token: string
  defaultHeaders?: {
    [key: string | number]: any
  }
}

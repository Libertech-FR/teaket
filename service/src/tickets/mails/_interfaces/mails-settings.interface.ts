export interface MailsSettingsInterface {
  url: string
  token: string
  defaultHeaders?: {
    // eslint-disable-next-line
    [key: string | number]: any
  }
}

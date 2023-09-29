import * as bodyParser from 'body-parser'

export interface RawBodyBufferOptions {
  whitelistedHeaders?: string[]
  blacklistedHeaders?: string[]
  limit?: string
}

export function rawBodyBuffer(options?: RawBodyBufferOptions) {
  return [
    bodyParser.urlencoded({ limit: options.limit, extended: true }),
    bodyParser.json({ limit: options.limit }),
  ]
}

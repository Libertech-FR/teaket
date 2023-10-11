import type { components } from '#build/types/service-api'

import { Metadata } from './'
type FragmentPartDto = components['schemas']['FragmentPartDto']
type Attachments = components['schemas']['IdfsPartDto'][]
export interface Threads {
  [date: string]: Thread[]
}

export interface Thread {
  _id: string
  metadata: Metadata
  ticketId: string | Record<string, never>
  fragments: Fragments
  attachments: Attachments
}

export interface Fragments {
  raw?: FragmentPartDto[]
  file?: FragmentPartDto[]
}

export interface File {
  id: string
  disposition: string
  message: string
  filestorage: Filestorage
}

export interface Filestorage {
  id: string
  name: string
  namespace: string
  path: string
  mime: string
}

export interface Raw {
  id: string
  disposition: string
  message: string
}

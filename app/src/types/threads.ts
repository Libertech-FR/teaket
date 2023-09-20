import { FragmentPartDto } from '~/tickets/thread/_dto/parts/fragment.part.dto'
import { Metadata } from './'

export interface Threads {
  [date: string]: Thread[]
}

export interface Thread {
  _id: string
  metadata: Metadata
  ticketId: string
  fragments: Fragments
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

import type { components } from '@libertech-fr/mailrest-sdk'

export type MailRestAccountType = components['schemas']['AccountsMetadataV1']
export type MailRestMessageType = components['schemas']['FetchMessageDto']
export type MailRestMailSubmit = Partial<components['schemas']['AccountSubmitDto']>
export type MailRestMailSubmited = components['schemas']['AccountSubmitedDto']

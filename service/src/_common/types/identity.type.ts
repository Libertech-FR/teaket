import { Identities } from '~/core/identities/_schemas/identities.schema'

export const ExcludeIdentityType: (keyof Identities)[] = ['password']

export type IdentityType = Partial<Omit<Identities, 'password'>>

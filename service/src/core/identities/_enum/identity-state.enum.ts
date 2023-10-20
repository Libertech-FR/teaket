export enum IdentityState {
  DISABLED = -1,
  PENDING = 0,
  ACTIVE = 1,
}

export const IdentityStateList: number[] = Object.keys(IdentityState)
  // eslint-disable-next-line
  .filter((k) => typeof IdentityState[k as any] === 'number')
  // eslint-disable-next-line
  .map((k) => parseInt(IdentityState[k as any], 10))

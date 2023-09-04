export enum IdentityState {
  DISABLED = -1,
  PENDING = 0,
  ACTIVE = 1,
}

export const IdentityStateList: number[] = Object.keys(IdentityState)
  .filter((k) => typeof IdentityState[k as any] === 'number')
  .map((k) => parseInt(IdentityState[k as any], 10))

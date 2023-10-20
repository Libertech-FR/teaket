export enum EntityState {
  ARCHIVED = -1,
  INACTIVE = 0,
  ACTIVE = 1,
}

export const EntityStateList: number[] = Object.keys(EntityState)
  // eslint-disable-next-line
  .filter((k) => typeof EntityState[k as any] === 'number')
  // eslint-disable-next-line
  .map((k) => parseInt(EntityState[k as any], 10))

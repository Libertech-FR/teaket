export enum EntityType {
  AGENT = 1,
  CONTACT = 2,
  CLIENT = 3,
  COMPANY = 4,
}

export const EntityTypeList: number[] = Object.keys(EntityType)
  .filter((k) => typeof EntityType[k as any] === 'number')
  .map((k) => parseInt(EntityType[k as any], 10))

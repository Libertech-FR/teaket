export enum EntityType {
  CONSOLE = 0,
  OPERATOR = 1,
  AGENT = 2,
  CLIENT = 3,
  COMPANY = 4,
  OTHER = 99,
}

export const EntityTypeList: number[] = Object.keys(EntityType)
  .filter((k) => typeof EntityType[k as any] === 'number')
  .map((k) => parseInt(EntityType[k as any], 10))

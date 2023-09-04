export enum UserType {
  CONSOLE = 0,
  OPERATOR = 1,
  AGENT = 2,
  CLIENT = 3,
  COMPANY = 4,
  OTHER = 99,
}

export const UserTypeList: number[] = Object.keys(UserType)
  .filter((k) => typeof UserType[k as any] === 'number')
  .map((k) => parseInt(UserType[k as any], 10))

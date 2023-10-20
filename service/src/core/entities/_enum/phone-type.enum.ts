export enum PhoneType {
  OTHER = 1,
  HOME = 2,
  PROFESSIONAL = 3,
  PERSONAL = 4,
  FAX = 5,
}

export const PhoneTypeList: number[] = Object.keys(PhoneType)
  // eslint-disable-next-line
  .filter((k) => typeof PhoneType[k as any] === 'number')
  // eslint-disable-next-line
  .map((k) => parseInt(PhoneType[k as any], 10))

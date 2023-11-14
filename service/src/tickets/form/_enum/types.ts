export enum FormTypes {
  'SIMPLE' = 0,
  'STEPS' = 1,
  'TABS' = 2,
}

export const FormTypeList: number[] = Object.keys(FormTypes)
  .filter((k) => typeof FormTypes[k as any] === 'number') // eslint-disable-line
  .map((k) => parseInt(FormTypes[k as any], 10)) // eslint-disable-line

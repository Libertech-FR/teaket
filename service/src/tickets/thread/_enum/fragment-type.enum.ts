export enum FragmentType {
  RAW = 'raw',
  FILE = 'file',
}

export const FragmentTypeList: number[] = Object.keys(FragmentType)
  .filter((k) => typeof FragmentType[k] === 'string')
  .map((k) => FragmentType[k])

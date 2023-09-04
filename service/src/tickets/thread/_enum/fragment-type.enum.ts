export enum FragmentType {
  INLINE = 'inline',
  ATTACHMENT = 'attachment',
}

export const FragmentTypeList: number[] = Object.keys(FragmentType)
  .filter((k) => typeof FragmentType[k] === 'string')
  .map((k) => FragmentType[k])

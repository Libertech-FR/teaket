export enum FsType {
  DIRECTORY = 'd',
  FILE = 'f',
  SYMLINK = 'l',
  EMBED = 'e',
}

export const FsTypeList: number[] = Object.keys(FsType)
  // eslint-disable-next-line
  .filter((k) => typeof FsType[k as any] === 'string')
  // eslint-disable-next-line
  .map((k) => FsType[k as any])

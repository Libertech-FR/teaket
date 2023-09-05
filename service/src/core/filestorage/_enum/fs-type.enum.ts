export enum FsType {
  DIRECTORY = 'd',
  FILE = 'f',
  SYMLINK = 'l',
}

export const FsTypeList: number[] = Object.keys(FsType)
  .filter((k) => typeof FsType[k as any] === 'string')
  .map((k) => FsType[k as any])

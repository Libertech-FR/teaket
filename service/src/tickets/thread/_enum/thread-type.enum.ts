export enum ThreadType {
  SYSTEM = 1,
  INTERNAL = 2,
  EXTERNAL = 3,
  INCOMING = 4,
  OUTGOING = 5,
}

export const ThreadTypeList: number[] = Object.keys(ThreadType)
  .filter((k) => typeof ThreadType[k as any] === 'number')
  .map((k) => parseInt(ThreadType[k as any], 10))

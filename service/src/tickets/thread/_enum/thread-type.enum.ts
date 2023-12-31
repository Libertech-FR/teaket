export enum ThreadType {
  SYSTEM = 1,
  INTERNAL = 2,
  EXTERNAL = 3,
  INCOMING = 4,
  OUTGOING = 5,
}

export const ThreadTypeLabel: Record<ThreadType, string> = {
  [ThreadType.SYSTEM]: 'System',
  [ThreadType.INTERNAL]: 'Internal',
  [ThreadType.EXTERNAL]: 'External',
  [ThreadType.INCOMING]: 'Incoming',
  [ThreadType.OUTGOING]: 'Outgoing',
}

export const ThreadTypeList: number[] = Object.keys(ThreadType)
  // eslint-disable-next-line
  .filter((k) => typeof ThreadType[k as any] === 'number')
  // eslint-disable-next-line
  .map((k) => parseInt(ThreadType[k as any], 10))

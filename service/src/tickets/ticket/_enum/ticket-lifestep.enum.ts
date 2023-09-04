export enum TicketLifestep {
  MERGED = -2,
  ARCHIVED = -1,
  CLOSED = 0,
  OPEN = 1,
}

export const TicketLifestepList: number[] = Object.keys(TicketLifestep)
  .filter((k) => typeof TicketLifestep[k as any] === 'number')
  .map((k) => parseInt(TicketLifestep[k as any], 10))

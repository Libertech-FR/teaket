export enum TicketType {
  INCIDENT = 1,
  REQUEST = 2,
}

export const TicketTypeList: number[] = Object.keys(TicketType)
  .filter((k) => typeof TicketType[k as any] === 'number')
  .map((k) => parseInt(TicketType[k as any], 10))

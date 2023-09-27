export const ticketType = [
  { label: 'Incident', value: 1, icon: 'mdi-account-alert', color: 'red' },
  { label: 'Demande', value: 2, icon: 'mdi-account-question', color: 'primary' },
]

export const lifeSteps = [
  { label: 'Ouvert', value: 1, group: 'lifestep', icon: 'mdi-circle', color: 'green' },
  { label: 'Clos', value: 0, group: 'lifestep', icon: 'mdi-circle', color: 'red' },
]

export enum TicketType {
  INCIDENT = 1,
  DEMANDE = 2,
}

export enum LifeStep {
  OPEN = 1,
  CLOSED = 0,
}

export enum ThreadType {
  SYSTEM = 1,
  INTERNAL = 2,
  EXTERNAL = 3,
  INCOMING = 4,
  OUTGOING = 5,
}

export enum Impact {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum Priority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent',
}

export enum FsType {
  DIRECTORY = 'd',
  FILE = 'f',
  SYMLINK = 'l',
}

export const impact = [
  {
    id: '612345678901234567890123',
    name: Impact.Low,
  },
  {
    id: '712345678901234567890123',
    name: Impact.Medium,
  },
  {
    id: '812345678901234567890123',
    name: Impact.High,
  },
  {
    id: '912345678901234567890123',
    name: Impact.Critical,
  },
]

export const priority = [
  {
    id: '612345678901234567890123',
    name: Priority.Low,
  },
  {
    id: '712345678901234567890123',
    name: Priority.Normal,
  },
  {
    id: '812345678901234567890123',
    name: Priority.High,
  },
  {
    id: '912345678901234567890123',
    name: Priority.Urgent,
  },
]

export const threadTypes = [
  {
    label: 'Système',
    value: ThreadType.SYSTEM,
  },
  {
    label: 'Interne',
    value: ThreadType.INTERNAL,
  },
  {
    label: 'Externe',
    value: ThreadType.EXTERNAL,
  },
  {
    label: 'Entrant',
    value: ThreadType.INCOMING,
  },
  {
    label: 'Sortant',
    value: ThreadType.OUTGOING,
  },
]

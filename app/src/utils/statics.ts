export const ticketType = [
  { label: 'Incident', value: 1, icon: 'mdi-account-alert', color: 'red' },
  { label: 'Demande', value: 2, icon: 'mdi-account-question', color: 'primary' },
]

export const lifeSteps = [
  { label: 'Ouvert', value: 1, group: 'lifestep', icon: 'mdi-circle', color: 'green' },
  { label: 'Clos', value: 0, group: 'lifestep', icon: 'mdi-circle', color: 'red' },
]

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

export const impact = [
  {
    _id: generateMongoId(),
    name: Impact.Low,
  },
  {
    _id: generateMongoId(),
    name: Impact.Medium,
  },
  {
    _id: generateMongoId(),
    name: Impact.High,
  },
  {
    _id: generateMongoId(),
    name: Impact.Critical,
  },
]

export const priority = [
  {
    _id: generateMongoId(),
    name: Priority.Low,
  },
  {
    _id: generateMongoId(),
    name: Priority.Normal,
  },
  {
    _id: generateMongoId(),
    name: Priority.High,
  },
  {
    _id: generateMongoId(),
    name: Priority.Urgent,
  },
]

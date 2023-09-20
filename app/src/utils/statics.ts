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

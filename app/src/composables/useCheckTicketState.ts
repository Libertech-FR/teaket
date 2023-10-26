import { LifeStep } from '../utils'

export default function useCheckTicketState(currentLifeStep: LifeStep) {

  const isDisabledTicket = computed(() => {
    return currentLifeStep !== LifeStep.OPEN
  })

  const isArchivedTicket = computed(() => {
    return currentLifeStep === LifeStep.ARCHIVED
  })

  return { currentLifeStep, isArchivedTicket, isDisabledTicket }
}

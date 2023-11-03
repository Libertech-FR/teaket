import type { components } from '#build/types/service-api'
import { useQuasar } from 'quasar'
import { ComponentInternalInstance } from 'vue'
import { LifeStep, lifeSteps } from '../utils'

export default function useCloseTicket() {
  const $q = useQuasar()
  type Ticket = components['schemas']['TicketDto']
  const tickets = ref<Ticket[]>([])

  const multipleTickets = computed(() => {
    if (!tickets.value) return false
    return tickets.value.length > 1
  })

  function getTickets(newTickets: Ticket | Ticket[]): Ticket[] {
    return Array.isArray(newTickets) ? newTickets : [newTickets]
  }

  async function updateTickets(tickets: Ticket[], lifestep: LifeStep) {
    if (tickets === null) return
    const { data, error } = await useHttpApi('/tickets/ticket/update-many', {
      method: 'post',
      body: {
        ids: tickets.map((s) => s._id),
        lifestep,
      },
    })
    if (error.value) {
      $q.notify({
        message: `Impossible de passer le${multipleTickets.value ? 's' : ''} ticket${multipleTickets.value ? 's' : ''} a l'état ${getLifestepLabel(lifestep)}`,
        type: 'negative',
      })
      return false
    } else {
      $q.notify({
        message: `Ticket${multipleTickets.value ? 's' : ''} passé${multipleTickets.value ? 's' : ''} a l'état ${getLifestepLabel(lifestep)}`,
        type: 'positive',
      })
      return true
    }
  }

  function getLifestepLabel(lifestep: LifeStep) {
    const result = lifeSteps.find((lifeStep) => lifeStep.value === lifestep)
    if(result) return result.label
    return 'Etat inconnu'
  }

  /**
   *@param {Payload} payload
   */
  function openDialog(payload: { ticket: Ticket | Ticket[]; lifestep: LifeStep; refreshEvent?: () => void }): void {
    const { ticket, lifestep, refreshEvent } = payload
    const tickets = getTickets(ticket)
    $q.dialog({
      title: 'Confirmation',
      message: `Voulez-vous passer le${multipleTickets.value ? 's' : ''} ticket${multipleTickets.value ? 's' : ''} selectionné${multipleTickets.value ? 's' : ''} a l'état ${getLifestepLabel(lifestep)}?`,
      ok: {
        push: true,
      },
      cancel: {
        push: true,
        color: 'negative',
      },
    }).onOk(async () => {
      const test = await updateTickets(tickets, lifestep)
      if (test && refreshEvent !== undefined) return refreshEvent()
    })
  }

  return { openDialog }
}

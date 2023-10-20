import type { components } from "#build/types/service-api"
import { useQuasar } from "quasar";
import { defineEmits } from 'vue'
import { ComponentInternalInstance } from 'vue'

export default function useCloseTicket() {
  const $q = useQuasar()
  type Ticket = components['schemas']['TicketDto']
  type emit = ComponentInternalInstance['emit']

  const emit = defineEmits(['refresh'])


  const tickets = ref<Ticket[]>([])

  const multipleTickets = computed(() => {
    if(!tickets.value) return false
    return tickets.value.length > 1
  })

  function setTickets(newTickets: Ticket | Ticket[]) {
    Array.isArray(newTickets)
        ? tickets.value = [...tickets.value, newTickets]
        : tickets.value.push(newTickets)
  }

  async function closeTickets() {
      if(tickets.value === null) return
      const { data, error } = await useHttpApi('/tickets/ticket/close-many', {
          method: 'post',
          body: {
              ids: tickets.value.map(s => s._id)
          }
      })
      if (error.value) {
          $q.notify({
              message: `Impossible de cloturer le${multipleTickets.value ? 's' : ''} ticket${multipleTickets.value ? 's' : ''}`,
              type: 'negative'
          })
          return false
      } else {
          $q.notify({
              message: `Ticket${multipleTickets.value ? 's' : ''} cloturé${multipleTickets.value ? 's' : ''}`,
              type: 'positive'
          })
          return true
      }
  }

  /**
   *@param {Payload} payload
   */
  function openDialog(
    payload: {
        ticket: Ticket | Ticket[];
        refreshEvent: Function | null;
    }): void {
    const { ticket, refreshEvent } = payload
    setTickets(ticket)
    $q.dialog({
        title: 'Confirmation',
        message: `Voulez-vous clore le${multipleTickets.value ? 's' : ''} ticket${multipleTickets.value ? 's' : ''} selectionné${multipleTickets.value ? 's' : ''} ?`,
        ok: {
          push: true
        },
        cancel: {
          push: true,
          color: 'negative'
        }
    }).onOk(async () => {
      if(await closeTickets() && refreshEvent ) refreshEvent()
    })
  }

  return { openDialog }
}

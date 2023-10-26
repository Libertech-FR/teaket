<template lang="pug">
q-td
  q-btn-group(flat rounded dark)
    q-btn(:icon="isDisabledTicket ? 'mdi-eye' : 'mdi-pencil'" color="primary" @click="goToTicket" size="sm" flat)
      q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher le ticket
    q-btn(v-if="!isArchivedTicket" :icon="isDisabledTicket ? 'mdi-lock-open-variant' : 'mdi-lock'" color="primary" @click="updateLifestep(buttonAction)" size="sm" flat)
      q-tooltip.text-body2(transition-show="scale" transition-hide="scale" v-text="isDisabledTicket ? 'Ouvrir le ticket' : 'Clore le ticket'" )
    q-btn(v-if="isDisabledTicket" icon='mdi-archive' color='primary' @click='updateLifestep(LifeStep.ARCHIVED)' size="sm" flat)
      q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Archiver le ticket
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { LifeStep } from '~/utils'
import type { components } from '#build/types/service-api'
import type { PropType } from 'vue'
import { useRouter } from 'nuxt/app'
import { useCheckTicketState } from '../../../../.nuxt/imports'
type Ticket = components['schemas']['TicketDto']

const props = defineProps({
  ticket: {
    type: Object as PropType<components['schemas']['TicketDto']>,
    default: () => ({}),
  },
})
const emit = defineEmits(['closeTicket', 'clear', 'updateLifestep'])

const isDisabledTicket = computed(() => {
  return props.ticket.lifestep !== LifeStep.OPEN
})

const isArchivedTicket = computed(() => {
  return props.ticket.lifestep === LifeStep.ARCHIVED
})

const buttonAction = computed(() => {
  return props.ticket.lifestep !== LifeStep.OPEN ? LifeStep.OPEN : LifeStep.CLOSED
})

// const { isArchivedTicket, isDisabledTicket } = useCheckTicketState(toRefs(props.ticket.lifestep))
// currentLifeStep.value = props.ticket.lifestep

function closeTicket() {
  emit('closeTicket', props.ticket)
}

function updateLifestep(lifestep: LifeStep) {
  emit('updateLifestep', { ticket: props.ticket, lifestep })
}

function goToTicket() {
  useRouter().push(`/ticket/${props.ticket._id}`)
}
</script>

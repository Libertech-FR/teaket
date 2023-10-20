<template lang="pug">
q-td
    q-btn-group(flat rounded dark)
        q-btn(:icon="isDisabledTicket ? 'mdi-eye' : 'mdi-pencil'" color="white" @click="goToTicket" size="sm" flat)
            q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher le ticket
        q-btn(icon="mdi-delete" color="white" @click="closeTicket" size="sm" flat :disable="isDisabledTicket")
            q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Clore le ticket
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { LifeStep } from '~/utils'
import type { components } from '#build/types/service-api'
import type { PropType } from 'vue'
import { useRouter } from 'nuxt/app'
type Ticket = components['schemas']['TicketDto']

const props = defineProps({
  ticket: {
    type: Object as PropType<components['schemas']['TicketDto']>,
    default: () => ({}),
  },
})
const emit = defineEmits(['closeTicket', 'clear'])

const isDisabledTicket = computed(() => {
  return props.ticket.lifestep !== LifeStep.OPEN
})

function closeTicket() {
  emit('closeTicket', props.ticket)
}

function goToTicket() {
  useRouter().push(`/ticket/${props.ticket._id}`)
}
</script>

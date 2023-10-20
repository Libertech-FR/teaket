import { mode } from 'process';
<template lang="pug">
q-dialog(:model-value="modelValue")
    q-card.q-pa-sm
        q-card-section.row.items-center
            .col-12.text-h6.text-center
                | Voulez vous vraiment cloturer les tickets sélectionnés ?
        q-card-actions
            q-btn(color="red" label="Annuler" flat @click="close()")
            q-btn(color="green" label="Confirmer" flat @click="closeTickets")
</template>

<script lang="ts" setup>
import { useHttpApi } from '~/composables/useHttpApi'
import type { components } from '#build/types/service-api'
import { useQuasar } from 'quasar'
import type { PropType } from 'vue'
type Ticket = components['schemas']['TicketDto']

const $q = useQuasar()
const props = defineProps({
  selected: {
    type: Array as PropType<Ticket[]>,
    default: () => [],
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'refresh'])

async function closeTickets() {
  const { data, error } = await useHttpApi('/tickets/ticket/close-many', {
    method: 'post',
    body: {
      ids: props.selected.map((s) => s._id),
    },
  })
  if (error.value) {
    emit('update:modelValue', false)
    $q.notify({
      message: 'Impossible de cloturer les tickets',
      type: 'negative',
    })
  } else {
    emit('refresh')
    emit('update:modelValue', false)
    $q.notify({
      message: 'Tickets cloturés',
      type: 'positive',
    })
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>

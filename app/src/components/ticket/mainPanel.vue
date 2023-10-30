<template lang="pug">
q-card(style="height: 100%").column
  q-toolbar.col
    q-toolbar-title {{ props.ticketData.sequence }} | {{ props.ticketData.subject }}
    q-space
    q-chip(:icon="lifestepOfTicket?.icon" :color="lifestepOfTicket?.color" outline).q-mx-auto {{ lifestepOfTicket?.label }}
  tk-SearchfiltersThreads.col
  tk-threadsList.col-8(ref="threadsListRef" @email:response="emailReponse($event)")
  tk-threadsEditor.col-3(ref="threadsEditorRef" @refreshThreadsList="refreshThreadsList")
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import type { components } from '#build/types/service-api'
import { TkThreadsList, TkThreadsEditor } from '#components'
type ThreadDto = components['schemas']['ThreadDto']
type Ticket = components['schemas']['TicketDto']

const props = defineProps({
  sequence: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  ticketData: {
    type: Object as PropType<Ticket>,
    required: true,
  },
})

const threadsListRef = ref<InstanceType<typeof TkThreadsList> | null>(null)
const threadsEditorRef = ref<InstanceType<typeof TkThreadsEditor> | null>(null)

const refreshThreadsList = () => {
  if (!threadsListRef.value) return
  threadsListRef.value.$.exposed.threadsRefresh()
}
type MailinfoPartDto = components['schemas']['MailinfoPartDto']
const emailReponse = (data: MailinfoPartDto) => {
  if (!threadsEditorRef.value) {
    return
  }
  threadsEditorRef.value?.emailReponse(data)
}

const lifestepOfTicket = computed(() => {
  return lifeSteps.find((step) => step.value === props.ticketData.lifestep)
})

defineExpose({
  refreshThreadsList,
})
</script>

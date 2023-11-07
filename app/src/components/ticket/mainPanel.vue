<template lang="pug">
q-splitter(horizontal v-model="splitterModel" separator-style="width: 2px" background-color="primary")
  template(#before)
    q-card(style="height: 100%").column
      q-toolbar.col-1
        q-toolbar-title {{ props.ticketData.sequence }} | {{ props.ticketData.subject }}
        q-space
        q-chip(:icon="lifestepOfTicket?.icon" :color="lifestepOfTicket?.color" outline).q-mx-auto {{ lifestepOfTicket?.label }}
      tk-SearchfiltersThreads.col-1
      tk-threadsList.col-10(ref="threadsListRef" @email:response="emailReponse($event)")
  template(#separator)
    q-avatar(size="xs" color="primary" icon="mdi-unfold-more-horizontal" class="text-white")
  template(#after).q-pa-sm.full-height
    tk-threadsEditor(ref="threadsEditorRef" @refreshThreadsList="refreshThreadsList")
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import type { components } from '#build/types/service-api'
import { TkThreadsList, TkThreadsEditor } from '#components'
type ThreadDto = components['schemas']['ThreadDto']
type Ticket = components['schemas']['TicketDto']
const splitterModel = ref(80)
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
  threadsEditorRef.value.$.exposed?.emailReponse(data)
}

const lifestepOfTicket = computed(() => {
  return lifeSteps.find((step) => step.value === props.ticketData.lifestep)
})

defineExpose({
  refreshThreadsList,
})
</script>

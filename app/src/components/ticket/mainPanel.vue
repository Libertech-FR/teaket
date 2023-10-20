<template lang="pug">
q-card(style="height: 100%").column
  q-toolbar.col
    q-toolbar-title {{ sequence }} | {{ subject }}
  tk-SearchfiltersThreads.col
  tk-threadsList.col-8(ref="threadsListRef" @email:response="emailReponse($event)")
  tk-threadsEditor.col-3(ref="threadsEditorRef" @refreshThreadsList="refreshThreadsList")
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { components } from '#build/types/service-api'
import { TkThreadsList } from '#components'
import { TkThreadsEditor } from '#components'
type ThreadDto = components['schemas']['ThreadDto']
const props = defineProps({
  sequence: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
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
</script>

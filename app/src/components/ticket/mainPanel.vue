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

const props = defineProps({
  sequence: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
})

const threadsListRef = ref(null)
const threadsEditorRef = ref(null)

const refreshThreadsList = () => {
  threadsListRef.value?.$.exposed.threadsRefresh()
}

const emailReponse = (data: ThreadDto) => {
  threadsEditorRef.value?.$.exposed.emailReponse(data)
}
</script>
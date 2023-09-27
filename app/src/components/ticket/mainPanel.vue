<template lang="pug">
q-card(style="height: 100%").column
  q-toolbar.col
    q-toolbar-title {{ sequence }} | {{ subject }}
  tk-threadsList.col-8
  tk-SearchfiltersThreads.col
  tk-threadsEditor.col-3
</template>

<script lang="ts" setup>
const props = defineProps({
  sequence: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>
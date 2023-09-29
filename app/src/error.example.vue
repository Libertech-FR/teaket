<template>
  <div>
    <p>{{ error.statusCode }}</p>
    <p>{{ error.message }}</p>
  </div>
</template>

<script lang='ts' setup>
import { NuxtError } from '#app'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    default: null,
  },
})
</script>

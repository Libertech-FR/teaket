<template lang="pug">
div
  p {{ error.statusCode }}
  p {{ error.message }}

  q-btn(@click="$router.push('/')") Retour à l'accueil
</template>

<script lang="ts" setup>
import { NuxtError } from '#app'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    default: null,
  },
})
</script>

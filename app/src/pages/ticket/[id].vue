<template lang="pug">
    
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'nuxt/app';

const route = useRoute()
const id = ref<string>('')

onMounted(() => {
    id.value = route.params.id
})
</script>
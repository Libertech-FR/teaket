<template lang="pug">
q-btn(flat icon="mdi-refresh" @click="refresh" color="primary")
    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Rafraichir
</template>
    
<script lang="ts" setup>
import type { PropType } from 'vue'
const emit = defineEmits(['refresh'])
function refresh() {
    emit('refresh')
}
</script>
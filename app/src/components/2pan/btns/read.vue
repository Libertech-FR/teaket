<template lang="pug">
q-btn(icon="mdi-eye" color="primary" @click="read" size="sm" flat)
    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") {{ tooltip }}
</template> 
        
<script lang="ts" setup>
const props = defineProps({
    tooltip: {
        type: String,
        default: () => 'Afficher',
    },
})

const emit = defineEmits(['read'])
function read() {
    emit('read')
}
</script>
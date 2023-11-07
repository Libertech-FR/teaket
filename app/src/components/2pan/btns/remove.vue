<template lang="pug">
q-btn(flat icon="mdi-delete" @click="remove" size="sm" color="negative")
    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") {{ tooltip  }}
</template>
            
<script lang="ts" setup>
import type { PropType } from 'vue'
const props = defineProps({
    tooltip: {
        type: String,
        default: () => 'Supprimer',
    },
})

const emit = defineEmits(['remove'])
function remove() {
    emit('remove')
}
</script>
<template lang="pug">
q-radio(v-bind="attrs" v-on="listeners")
</template>
    
<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const { emit } = defineEmits();

const selectedValue = ref('');

const emitCustomEvent = (value: string) => {
    emit('custom-event', value);
};
</script>
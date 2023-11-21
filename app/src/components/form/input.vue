<template lang="pug">
q-input(v-bind="attrs" v-on="listeners")
</template>

<script setup lang="ts">
import { ref } from 'vue';

const { emit } = defineEmits();

const inputValue = ref('');

const emitCustomEvent = (value: string) => {
    emit('custom-event', value);
};
</script>

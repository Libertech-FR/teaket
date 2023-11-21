<template lang="pug">
q-checkbox(v-bind="attrs" v-on="listeners")
</template>
    
<script setup lang="ts">
import { ref } from 'vue';

const { emit } = defineEmits();

const checkedValue = ref(false);

const emitCustomEvent = (value: boolean) => {
    emit('custom-event', value);
};

function submit() {
    emit('custom-event', checkedValue.value);
}
</script>
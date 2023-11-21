<template lang="pug">
q-select(v-bind="attrs" v-on="listeners")
</template>
    
<script setup lang="ts">
import { ref } from 'vue';

const { emit } = defineEmits();
const props = defineProps({
    options: {
        type: Array,
        required: true,
        description: 'The options',
    },
    modelValue: {
        type: Array,
        required: true,
        description: 'The model value',
    },
    optionLabel: {
        type: String,
        description: 'The field to display',
    },
    emitValue: {
        type: Boolean,
        default: false,
        description: 'Emit the value instead of the object',
    },
    optionValue: {
        type: String,
        description: 'The field to use as value',
    },
});

const selectedValue = ref('');

const emitCustomEvent = (value: string) => {
    emit('custom-event', value);
};
</script>
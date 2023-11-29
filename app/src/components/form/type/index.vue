<template lang="pug">
component(
    :is="`tk-form-type-${typeName}`"
    :sections="sections"
    :fields="fields"
)
    //pre {{ typeForm }} {{ sections }}
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import type { PropType } from 'vue'
import type { components } from "#build/types/service-api"

enum FormTypes {
    'BASE' = 0,
    'STEPS' = 1,
    'TABS' = 2,
}

const props = defineProps({
    type: {
        type: Number as PropType<FormTypes>,
        required: true
    },
    sections: {
        type: Object,
        default: () => ({}),
        required: false
    },
    fields: {
        type: Object,
        default: () => ({}),
        required: false
    }
})

const typeName = computed(() => {
    switch (props.type) {
        case FormTypes.BASE:
            return 'base'
        case FormTypes.STEPS:
            return 'stepper'
        case FormTypes.TABS:
            return 'tabs'
        default:
            return 'base'
    }
})

const sectionsLabel = computed(() => {
    return Object.keys(props.sections)
})
</script>
    
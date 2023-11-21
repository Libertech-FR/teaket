<template lang="pug">
div
    q-tabs(align="justify" v-model="tab" class="text-primary")
        q-tab(v-for="section in sectionsLabel" :key="section" :name="section" :label="props.sections[section].label")
    q-tab-panels(v-model="tab" class="text-primary" animated )
        q-tab-panel(v-for="section in sectionsLabel" :key="section" :name="section" :label="props.sections[section].label")
            tk-form-type(:type="section.type" :sections="props.sections[section].sections" :fields="props.sections[section].fields")
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
const props = defineProps({
    sections: {
        type: Object,
        required: true
    }
})

enum FormTypes {
    'BASE' = 0,
    'STEPS' = 1,
    'TABS' = 2,
}

const tab = ref<string>('')

const sectionsLabel = computed(() => {
    return Object.keys(props.sections)
})
tab.value = sectionsLabel.value[0]
</script>
        
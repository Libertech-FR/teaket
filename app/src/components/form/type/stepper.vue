<template lang="pug">
div
    q-stepper(v-model="step" bordered color="primary" animated ref="stepper")
        template(#navigation)
            q-space
            q-stepper-navigation 
                q-btn(
                    :disable="step === sectionsLabel[0]"
                    @click="stepper?.previous()"
                    label="Precedent"
                    color="primary"
                    flat
                )

                q-btn(
                    :disable="step === sectionsLabel[sectionsLabel.length - 1]"
                    @click="stepper?.next()"
                    label="Suivant"
                    color="primary"
                    flat
                )
        q-step(v-for="section in sectionsLabel" :key="section" :name="section" :title="props.sections[section].label" :done="doneSteps[section]")
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

const stepper = ref<HTMLElement | null>(null)

const sectionsLabel = computed(() => {
    return Object.keys(props.sections)
})

const step = ref<string>('')
step.value = sectionsLabel.value[0]


const doneSteps = sectionsLabel.value.reduce((acc: { [key: string]: boolean }, cur) => {
    acc[cur] = false
    return acc
}, {})
</script>
        
<template lang="pug">
q-card 
    q-card-section 
        q-toolbar
            q-toolbar-title {{ json.title }}
        q-toolbar(inset)
            span {{ json.description }}
    q-card-section
        tk-form-type(:type="json.type" :sections="json.sections")
    q-card-actions
        q-space
        q-btn(
            @click="submit"
            label="Envoyer"
            color="primary"
            flat
        )
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import type { PropType } from 'vue'
import type { components } from "#build/types/service-api"
import { construct, set } from 'radash';
type Form = components['schemas']['FormDto']
const props = defineProps({
    json: {
        type: Object as PropType<Form>,
        required: true
    }
})

const sectionsLabel = computed(() => {
    return Object.keys(props.json.sections)
})

let data = reactive({})
const form = computed(() => {
    return { ...construct(data) }
})

function submit() {
    const response = useHttpApi(props.json.submitApiUrl, {
        method: 'post',
        body: form.value
    }, {
        message: 'La création a échoué',
        color: 'negative'
    })
    console.log(form.value)
}
provide<Form>("data", data)
</script>

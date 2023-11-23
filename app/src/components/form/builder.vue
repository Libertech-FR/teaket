<template lang="pug">
q-card.q-ma-sm
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
      @click="reset"
      label="Vider les champs"
      color="info"
      flat
    )
    q-btn(
      @click="resetValidation"
      label="Vider les erreurs"
      color="negative"
      flat
      )
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
import { construct, crush, set } from 'radash';
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


function resetValidation() {
  validations.value = {}
}

let data = ref({})
const form = computed(() => {
  return { ...construct(data) }
})

function reset() {
  data.value = {}
}

let validations = ref({})
async function submit() {
  const body = {
    ...form.value,
    ...props.json.defaultValues
  }
  const response = await useHttpApi(props.json.submitApiUrl + '?debug=1', {
    method: 'post',
    body
  }, {
    message: 'La création a échoué',
    color: 'negative'
  })

  if (response.error.value) {
    validations.value = response.error.value.data.validations
  }

}

provide<Form>("data", data)
provide("validations", validations)
</script>
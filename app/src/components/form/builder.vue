<template lang="pug">
q-card.q-ma-sm
  q-card-section
    q-toolbar
      q-toolbar-title {{ json.title }}
      q-space
      //tk-form-select(:options="CRUDModesList" v-model="mode" emit-value map-options flat dense)
      slot(name="top-actions")
        slot(name="before-top-actions")
        slot(name="after-top-actions")
    q-toolbar(inset)
      span {{ json.description }}
  q-card-section
    tk-form-type(:type="json.type" :sections="json.sections")
  q-card-actions
    slot(name="actions")
      slot(name="before-actions")
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
      slot(name="after-actions")
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import type { PropType } from 'vue'
import type { components } from "#build/types/service-api"
import { construct, crush, set } from 'radash';
import { CRUDMode, CRUDModesList } from '~/enums';

const mode = ref<CRUDMode>(CRUDMode.Create)
type Form = components['schemas']['FormDto']
const props = defineProps({
  json: {
    type: Object as PropType<Form>,
    required: true
  },
  modelValue: {
    type: Object as PropType<{ [key: string]: any }>,
    required: false
  }
})
const sectionsLabel = computed(() => {
  return Object.keys(props.json.sections)
})


function resetValidation() {
  //triggers v-model

  //reset values
  validations.value = {}
}

let data = ref({})
const form = computed(() => {
  return construct(data.value)
})

function reset() {
  Object.keys(data.value).forEach((key) => {
    data.value[key] = undefined
  })
  data.value = {}
}

let validations = ref({})
async function submit(): Promise<void> {
  const response = await useHttpApi(props.json.submitApiUrl, {
    method: 'post',
    body: {
      ...form.value,
      ...props.json.defaultValues
    }
  }, {
    message: 'La création a échoué',
    color: 'negative'
  })

  if (response.error.value) {
    validations.value = response.error.value.data.validations
  }

}

watch(() => mode.value, (value) => {
  if ((value === CRUDMode.Read || value === CRUDMode.Update) && props.modelValue) {
    const value = props.modelValue as { [key: string]: any }
    data.value = crush(value)
  }
}, {
  immediate: true
})

provide<Ref<CRUDMode>>("mode", mode)
provide<Form>("data", data)
provide("validations", validations)
</script>

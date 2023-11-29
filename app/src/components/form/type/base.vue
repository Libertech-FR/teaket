<template lang="pug">
q-card(flat)
  .row(v-for="(row, index) in rows" :key="index")
    div(v-for="(field, index) in row" :key="index" :class="`col-${field.col}`").q-pa-xs
      component(
        :is="`tk-form-${field.component}`"
        :label="field.label"
        v-bind="getAttrs(field)"
        :error-message="validations ? validations[field['model-value']] : ''"
        :error="validations?.hasOwnProperty(field['model-value'])"
        @update:model-value="resetValidation(field['model-value'])"
        v-model="data[field['model-value']]"
      )
</template>

<script lang="ts" setup>
import { Types } from 'mongoose'
import type { components } from "#build/types/service-api"
import { computed, inject, ref } from 'vue'
import type { MixedValue, TicketFormField } from '~/types'
import { CRUDMode } from '~/enums'
const mode = inject<Ref<CRUDMode>>("mode")
type Form = components['schemas']['FormDto']
const validations = inject<{ [key: string]: MixedValue }>("validations")

const props = defineProps({
  fields: {
    type: Object as PropType<{ [key: string]: TicketFormField }>,
    required: true
  }
})

const rows = computed(() => {
  return Object.values(props.fields).reduce((acc: { [key: string]: TicketFormField[] }, cur) => {
    if (acc[cur.row]) {
      acc[cur.row].push(cur)
    } else {
      acc[cur.row] = [cur]
    }
    return acc
  }, {})
})

function resetValidation(field: string) {
  if (validations?.value) delete validations.value[field]
}

function getAttrs(field: TicketFormField) {
  return {
    ...field.attrsOnDefault ?? {},
    ...field[`attrsOn${mode?.value}`]
  }
}

const data = inject<Form>("data")
</script>

<template lang="pug">
q-card(flat)
  .row(v-for="row in rows" :key="row")
    div(v-for="field in row" :key="field" :class="`col-${field.col}`").q-pa-xs
      component(
        :is="`tk-form-${field.component}`"
        :label="field.label"
        v-bind="getAttrs(field, 'Create')"
        :error-message="validations[field['model-value']]"
        :error="validations.hasOwnProperty(field['model-value'])"
        v-model="data[field['model-value']]"
      )
</template>

<script lang="ts" setup>
import { Types } from 'mongoose'
import type { components } from "#build/types/service-api"

type Form = components['schemas']['FormDto']
const validations = inject("validations")

const props = defineProps({
  fields: {
    type: Object as PropType<{ [key: string]: TicketFormField }>,
    required: true
  }
})

type MixedValue =
  | string
  | Types.ObjectId
  | Date
  | number
  | boolean
  | null
  | object
  | Array<MixedValue>
  | {
    [key: string | number]: MixedValue
  }


interface TicketFormField {
  component: string
  label: string
  'model-value': string
  row: number
  col: number
  attrsOnDefault: {
    [attr: string]: MixedValue
  }
  attrsOnCreate: {
    [attr: string]: MixedValue
  }
  attrsOnRead: {
    [attr: string]: MixedValue
  }
  attrsOnUpdate: {
    [attr: string]: MixedValue
  }
  attrsOnDelete: {
    [attr: string]: MixedValue
  }
}

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

function getAttrs(field: TicketFormField, mode: string) {
  return {
    ...field.attrsOnDefault ?? {},
    ...field[`attrsOn${mode}`]
  }
}

const data = inject<Form>("data")
</script>

<template lang="pug">
q-select.q-my-xs(
  v-bind="$attrs"
  :option-label="(item) => getValue(item, props.optionLabel)"
  :option-value="(item) => getValue(item, props.optionValue)"
  :emit-value="false"
  v-model='modelValue'
  use-input
  :options="filteredOptions"
  @new-value="createValue"
  @filter='filterOptions'
)
  template(#selected)
    span.text-negative(v-if='errorMessage' v-text='errorMessage')
    span(v-else-if='modelValueInternal' v-text='selectedLabel')
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useHttpApi } from '~/composables/useHttpApi'
import { get } from 'radash'
import type { PropType } from 'vue'

const $q = useQuasar()
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  apiUrl: {
    type: String,
    required: true,
    description: 'The url to fetch the data',
  },
  addManualValue: {
    type: Boolean,
    default: false,
    description: 'Allow to add a manual value',
  },
  multiple: {
    default: true,
    description: 'Allow to select multiple values',
  },
  modelValue: {
    required: true,
    description: 'The model value',
  },
  modelLabel: {
    type: String,
    required: true,
    description: 'The model displayed label',
  },
  optionLabel: {
    type: String,
    description: 'The field to display',
  },
  searchField: {
    type: String,
    default: 'label',
    description: 'The field to search',
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
  transformKeys: {
    type: Object as PropType<{ [key: string]: string }>,
    default: {},
    description: 'The keys to transform, ex: [{ "keyToChange": "newKey"}]',
  },
  additionalFilters: {
    type: Object as PropType<Filter[]>,
    default: [],
    description: 'Additional filters to add to the query',
  },
})

type Filter = {
  field: string
  value: string
  operator: string
}

const errorMessage = ref()
const modelValueInternal = ref()
const modelValue = computed({
  // eslint-disable-next-line
  get(): any {
    return props.modelValue
  },
  set(val: object) {
    errorMessage.value = null
    modelValueInternal.value = val
    emit('update:modelValue', props.emitValue ? val[`${props.optionValue}`] : val)
  },
})

if (props.emitValue) {
  watch(
    () => props.modelValue,
    async (val) => {
      if (!modelValueInternal.value || modelValueInternal.value[`${props.optionValue}`] !== val) {
        const { data, error } = await useHttpApi(
          props.apiUrl + '/' + props.modelValue,
          { method: 'get' },
          {
            silent: true,
          },
        )
        if (error.value) errorMessage.value = error.value?.data?.message || error.value?.message || error.value
        if (!data.value) {
          modelValueInternal.value = null
          return
        }
        modelValueInternal.value = data.value.data
      }
    },
    {
      immediate: true,
    },
  )
}

const selectedLabel = computed(() => {
  if (!modelValueInternal.value) return ''
  return get(modelValueInternal.value, props.modelLabel, '')
})

const filteredOptions = ref([])

onMounted(async () => {
  const params = props.additionalFilters.reduce((acc, filter) => {
    acc[`filters[${filter.operator}${filter.field}]`] = `${filter.value}`
    return acc
  }, {})

  const { data, pending, refresh, error } = await useHttpApi(props.apiUrl, { method: 'get', params })

  if (error.value) {
    $q.notify({
      message: 'Erreur lors de la recupération des données',
      color: 'negative',
    })
  }
  filteredOptions.value = data.value.data.map((item) => transform(item))
})

async function filterOptions(val, update) {
  if (filteredOptions.value.length > 8 && val.length < 3) {
    return
  }

  const params = props.additionalFilters.reduce((acc, filter) => {
    acc[`filters[${filter.operator}${filter.field}]`] = `${filter.value}`
    return acc
  }, {})
  const searchKey = `filters[^${props.searchField}]`
  params[searchKey] = `/${val}/i`
  const response = await useHttpApi(props.apiUrl, { method: 'get', params })

  update(() => {
    filteredOptions.value = response.data.value.data.map((item) => transform(item))
  })
}

function createValue(val, done) {
  if (!props.addManualValue) {
    return
  }

  if (val! > 0) {
    return
  }
  const label = props.optionLabel ? props.optionLabel : 'label'
  const value = props.optionValue ? props.optionValue : 'value'
  const createdValue = {
    [label]: val,
    [value]: val,
  }

  if (!props.modelValue.includes(val)) {
    done(createdValue, 'add-unique')
  }
}

function getValue(item, value) {
  if (!value) return item
  const getValue = get(item, value)
  if (!getValue) return item
  return getValue
}

function transform(item) {
  const keys = Object.keys(props.transformKeys)
  if (!keys.length) return item
  return keys.reduce((newItem, key) => {
    const newKey = props.transformKeys[key]
    newItem[newKey] = get(item, key)
    return newItem
  }, {})
}

</script>

<style scoped></style>

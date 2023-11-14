<template lang='pug'>
q-select.q-my-xs(
  v-bind="$attrs"
  :option-label="(item) => getValue(item, props.optionLabel)"
  :option-value="(item) => getValue(item, props.optionValue)"
  :emit-value="props.emitValue"
  :model-value="props.modelValue"
  @update:model-value="emit('update:modelValue', $event)"
  multiple use-input
  :options="filteredOptions"
  @new-value="createValue"
  @filter='filterOptions'
)
</template>

<script setup lang='ts'>
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
  modelValue: {
    type: Array,
    required: true,
    description: 'The model value',
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
  transform: {
    type: Function,
    default: (item) => item,
    description: 'Transform the item before emit',
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

const filteredOptions = ref([])

onMounted(async () => {
  const params = props.additionalFilters.reduce((acc, filter) => {
    acc[`filters[${filter.operator}${filter.field}]`] = `${filter.value}`
    return acc
  }, {})

  const {
    data,
    pending,
    refresh,
    error,
  } = await useHttpApi(props.apiUrl, { method: 'get', params })

  if (error.value) {
    $q.notify({
      message: 'Erreur lors de la recupération des entités',
      color: 'negative',
    })
  }
  filteredOptions.value = data.value.data.map((item) => props.transform(item))
})


async function filterOptions(val, update) {
  if (val.length < 3) {
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
    filteredOptions.value = response.data.value.data.map((item) => props.transform(item))
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
    done(createdValue, "add-unique")
  }
}

function getValue(item, value) {
  if (!value) return item
  const getValue = get(item, value)
  if (!getValue) return item
  return getValue
}

</script>

<style scoped></style>

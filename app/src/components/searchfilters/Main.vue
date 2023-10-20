<template lang="pug">
.row.q-gutter-sm.items-center.q-mt-sm
  //- .col.col-md-2
  //-     q-select(:options="fieldTypes" label="Type de champ" v-model="fieldType" clearable @update:model-value="clearFields(['field', 'comparator'])")
  .col.col-md-2
    q-select(:options="fields" label="Champs" v-model="field" clearable @update:model-value="onFieldChange($event)")
  .col.col-md-2
    q-select(:options="comparatorFilteredByType" label="Comparateurs" v-model="comparator" clearable @update:model-value="clearFields([])" :disable="isFieldDisabled.comparator")
      template(v-slot:selected-item="scope")
        q-icon(:name="scope.opt.icon" size="xs")
      template(v-slot:option="scope")
        q-item(v-bind="scope.itemProps")
          q-item-section(avatar)
            q-icon(:name="scope.opt.icon")
          q-item-section
            q-item-label
              span {{ scope.opt.label }}

  .col-12.col-md-2(v-show="!comparator?.multiplefields")
    q-input(v-model="search" label="Rechercher" clearable :type="searchInputType" :disable="isFieldDisabled.search" :prefix="comparator?.prefix" :suffix="comparator?.suffix")
  .col-6.col-md-2(v-show="comparator?.multiplefields")
    q-input(v-model="searchMin" label="Min" clearable :type="searchInputType" :disable="isFieldDisabled.search" )
  .col-6.col-md-2(v-show="comparator?.multiplefields")
    q-input(v-model="searchMax" label="Max" clearable :type="searchInputType" :disable="isFieldDisabled.search" )
  .col-12.col-md-1
    q-btn(color="primary" @click="addFilter" :disable="isFieldDisabled.addButton") Ajouter
  q-space
  .col-12.col-md-2
    tk-SearchfiltersRightSelect(ref="rightSelect")
</template>

<script lang="ts" setup>
import { ref, computed, inject } from 'vue'
import { useRouter, useRoute } from 'nuxt/app'
import { useDayjs } from '#imports'
import { pushQuery } from '~/composables'
import type { Filter, Field, Comparator, SearchFilter } from '~/types'
const dayjs = useDayjs()

const fields = inject<Field[]>('fieldsList')

const router = useRouter()
const route = useRoute()
const rightSelect = ref(null)
const inclus = ref(true)
const fieldType = ref<string>()

let field = ref<Field>()
let comparator = ref<Comparator>()
const search = ref('')
const searchMin = ref('')
const searchMax = ref('')

const filters = ref<Filter[]>([])

const fieldTypes = ref<
  {
    label: string
    value: string
  }[]
>([
  { label: 'Texte', value: 'text' },
  { label: 'Nombre', value: 'number' },
  { label: 'Date', value: 'date' },
])

const comparatorTypes = ref<Comparator[]>([
  { label: 'Egal à', querySign: '=', value: '=', icon: 'mdi-equal', type: ['number'], multiplefields: false, prefix: '', suffix: '' },
  { label: 'Différent', querySign: '!=', value: '!=', icon: 'mdi-exclamation', type: ['number'], multiplefields: false, prefix: '', suffix: '' },
  { label: 'Supérieur à', querySign: '>', value: '>', icon: 'mdi-greater-than', type: ['number', 'date'], multiplefields: false, prefix: '', suffix: '' },
  { label: 'Supérieur ou égal à', querySign: '>=', value: '>=', icon: 'mdi-greater-than-or-equal', type: ['number', 'date'], multiplefields: false, prefix: '', suffix: '' },
  { label: 'Inférieur à', querySign: '<', value: '<', icon: 'mdi-less-than', type: ['number', 'date'], multiplefields: false, prefix: '', suffix: '' },
  { label: 'Inférieur ou égal à', querySign: '<=', value: '<=', icon: 'mdi-less-than-or-equal', type: ['number', 'date'], multiplefields: false, prefix: '', suffix: '' },
  { label: 'entre', querySign: '<<', value: 'between', icon: 'mdi-arrow-expand-horizontal', type: ['number', 'date'], multiplefields: true, prefix: '', suffix: '' },
  { label: 'Contiens', querySign: '^', value: '^', icon: 'mdi-apple-keyboard-control', type: ['text'], multiplefields: false, prefix: '/', suffix: '/i' },
  { label: 'Commence par', querySign: '^', value: '/^', icon: 'mdi-apple-keyboard-control', type: ['text'], multiplefields: false, prefix: '/^', suffix: '/' },
  { label: 'Fini par', querySign: '^', value: '$/', icon: 'mdi-apple-keyboard-control', type: ['text'], multiplefields: false, prefix: '/', suffix: '$/' },
  { label: 'Egal à', querySign: '@', value: '@', icon: 'mdi-apple-keyboard-control', type: [], multiplefields: true, prefix: '', suffix: '' },
])

const onFieldChange = (value: Field) => {
  value === null ? (fieldType.value = '') : (fieldType.value = value.type)
  clearFields(['comparator'])
}

const clearFields = (fields: string[]) => {
  if (fields.includes('field')) field = ref()
  if (fields.includes('comparator')) comparator = ref()
  search.value = ''
  searchMin.value = ''
  searchMax.value = ''
}

const addFilter = async () => {
  const searchFilter = getSearchFilter.value
  if (!searchFilter) return
  if (searchFilter.comparator.multiplefields) {
    for (const { key, value } of parseMultipleFilter(searchFilter)) {
      await pushQuery({ key, value })
    }
  } else {
    const { key, value } = parseSimpleFilter(searchFilter)
    await pushQuery({ key, value })
  }
}

const parseSimpleFilter = (searchFilter: SearchFilter) => {
  if (searchFilter.field.type === 'date') {
    if (searchFilter.comparator.querySign === '<' || searchFilter.comparator.querySign === '>=') searchFilter.search = dayjs(searchFilter.search).startOf('day').toISOString()
    if (searchFilter.comparator.querySign === '>' || searchFilter.comparator.querySign === '<=') searchFilter.search = dayjs(searchFilter.search).endOf('day').toISOString()
  }
  return {
    key: `filters[${searchFilter.comparator.querySign}${searchFilter.field.name}]`,
    value: `${searchFilter.comparator.prefix}${searchFilter.search}${searchFilter.comparator.suffix}`,
  }
}

const parseMultipleFilter = (searchFilter: SearchFilter) => {
  if (searchFilter.field.type === 'date') {
    searchFilter.searchMin = dayjs(searchFilter.searchMin).startOf('day').toISOString()
    searchFilter.searchMax = dayjs(searchFilter.searchMax).endOf('day').toISOString()
  }
  const min = {
    key: `filters[>=${searchFilter.field.name}]`,
    value: `${searchFilter.comparator.prefix}${searchFilter.searchMin}${searchFilter.comparator.suffix}`,
  }
  const max = {
    key: `filters[<=${searchFilter.field.name}]`,
    value: `${searchFilter.comparator.prefix}${searchFilter.searchMax}${searchFilter.comparator.suffix}`,
  }
  return [min, max]
}

// const pushQuery = async (key: string, value: string) => {
//   const query = {
//     ...route.query,
//   }
//   query[key] = value
//   await router.push({
//     query
//   })
// }

const getSearchFilter = computed(() => {
  if (field.value === undefined || field.value === null) return null
  if (comparator.value === undefined || comparator.value === null) return null
  return {
    field: field!.value,
    comparator: comparator!.value,
    search: search.value,
    searchMin: searchMin.value,
    searchMax: searchMax.value,
  }
})

const searchInputType = computed(() => {
  if (fieldType.value === undefined || fieldType.value === null) return 'text'
  return fieldType.value
})

const fieldsFilteredByType = computed(() => {
  if (fieldType.value === undefined || fieldType.value === null) return []
  return fields?.filter((field) => {
    return field.type === fieldType.value
  })
})

const comparatorFilteredByType = computed(() => {
  if (fieldType.value === undefined || fieldType.value === null) return []
  return comparatorTypes.value.filter((comparator) => {
    return comparator.type.includes(fieldType.value!)
  })
})

const isFieldDisabled = computed(() => {
  return {
    field: false,
    comparator: !field.value,
    search: !field.value || !comparator.value,
    addButton: !field.value || !comparator.value || !search.value,
  }
})

defineExpose({
  comparatorTypes,
  rightSelect,
})
</script>

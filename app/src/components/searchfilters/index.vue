<template lang="pug" @keypress.enter="addFilter">
.q-ma-sm
    tk-SearchfiltersMain(ref="mainData")
    //Filters chips
    .row.q-gutter-sm.items-center.q-mt-sm
      q-chip(
        v-for="filter in filterArray" :key="filter.field"
        removable @remove="removeFilter(filter)"
      ) {{ filter.label }} {{ filter.comparator }} {{ filter.search }}
</template>

<script lang="ts" setup>
import { ref, computed, inject } from 'vue'
import { useRouter, useRoute } from 'nuxt/app'
import { useDayjs } from '#imports';
import type { Filter, Field, SearchFilter, Comparator, Option } from '~/types'
import type { LocationQueryValue } from 'vue-router'
type MainData = {
  comparatorTypes: Comparator[]
  rightSelect: {
    options: Option[]
  }
}

const dayjs = useDayjs()
const router = useRouter()
const route = useRoute()
const fields = inject('fieldsList', ref<Field[]>([]))
const mainData = ref<MainData>()

const parseSimpleFilter = (searchFilter: SearchFilter) => {
  if (searchFilter.field.type === 'date') {
    if (searchFilter.comparator.querySign === '<' || searchFilter.comparator.querySign === '>=') searchFilter.search = dayjs(searchFilter.search).startOf('day').toISOString()
    if (searchFilter.comparator.querySign === '>' || searchFilter.comparator.querySign === '<=') searchFilter.search = dayjs(searchFilter.search).endOf('day').toISOString()
  }
  return {
    key: `filters[${searchFilter.comparator.querySign}${searchFilter.field.name}]`,
    value: `${searchFilter.comparator.prefix}${searchFilter.search}${searchFilter.comparator.suffix}`
  }
}

const removeFilter = (filter: Filter) => {
  let key = `filters[${filter.querySign}${filter.field.replace('[]', '')}]`
  if (filter.field.endsWith('[]')) key += '[]'
  const query = {
    ...route.query,
  }
  delete query[key]
  router.push({
    query
  })
}

const getAllPrefixAndSuffixPattern = computed(() => {
  const allPrefix = mainData.value?.comparatorTypes.map(comparator => comparator.prefix) ?? []
  const allSuffix = mainData.value?.comparatorTypes.map(comparator => comparator.suffix) ?? []
  return [
    ...new Set([
      ...allPrefix,
      ...allSuffix
    ])]
})

const optionsRegrouped = (): { name: string, label: { label: string, value: string }[], type: string }[] => {
  // Initialize an empty object to store the results
  const result: { [key: string]: { label: string, value: string }[] } = {};
  const options = mainData.value?.rightSelect.options ?? []
  for (const item of options) {
    if (!item.header && item.group) {
      if (!result[item.group]) {
        result[item.group] = [];
      }
      result[item.group].push({ label: item.label, value: item.value! });
    }
  }

  return Object.keys(result).map(key => {
    return {
      name: key,
      label: result[key],
      type: 'multiple'
    }
  })
}

const getAllFields = () => {
  const rightSelectOptions = optionsRegrouped()
  return [
    ...fields.value,
    ...rightSelectOptions
  ]
}

const getLabelByName = (name: string) => {
  const field = getAllFields().find(field => field.name === name)
  if (!field) return name.replace('[]', '')
  if (field.type !== 'multiple') return (field.label as string).replace('[]', '')
  return field.name.replace('[]', '')
}

const getComparatorLabel = (comparator: string) => {
  const comparatorObj = mainData.value?.comparatorTypes.find(comparatorObj => comparatorObj.querySign === comparator)
  if (!comparatorObj) return comparator
  return comparatorObj.label.toLowerCase()
}

const getSearchString = (search: LocationQueryValue | LocationQueryValue[], fieldLabel: string) => {
  const field = getAllFields().find(field => field.name === fieldLabel.replace('[]', ''))
  if (!field) return ''
  if (field.type === 'multiple') {
    const searchArray = Array.isArray(search) ? search : [search]
    return searchArray.map(search => {
      const option = (field.label as { label: string, value: string }[]).find(option => option.value === search)
      if (!option) return search
      return option.label
    }).join(' ou ')
  }
  if (Array.isArray(search)) {
    return search.join(' ou ')
  }
  if (field?.type === 'date') {
    return dayjs(search).format('DD/MM/YYYY')
  }
  return sanitizeSearchString(search!.toString())
}

const sanitizeSearchString = (search: string) => {
  const allPrefixAndSuffixPattern = getAllPrefixAndSuffixPattern.value
  for (const pattern of allPrefixAndSuffixPattern) {
    search = search.replace(pattern, '')
  }
  return search
}

const exctractComparator = (key: string): {
  comparator: string
  field: string
} | null => {
  const match = key.match(/^(\=|\?|\#|\!|\>|\<|\^|\@)+/)
  if (!match) return null
  const comparator = match[0]
  const field = key.replace(comparator, '')
  return {
    comparator,
    field
  }
}

const filterArray = computed(() => {
  const queries = { ...route.query }
  const filters: Record<string, { label: string, field: string, comparator: string, querySign: string, search: string }> = {};

  // Iterate through the keys and values in the input object
  for (const key in queries) {
    if (queries.hasOwnProperty(key) && key.includes("filter")) {

      // Extract the key without the "filter[" and "]" parts
      const filteredKey = key.replace("filters[", "").replace("]", "");
      const exctract = exctractComparator(filteredKey)
      if (!exctract) continue
      const { comparator, field } = exctract

      // Assign the value to the extracted key in the filter array
      filters[key] = {
        label: getLabelByName(field),
        field,
        comparator: getComparatorLabel(comparator),
        querySign: comparator,
        search: getSearchString(queries[key], field)
      };
    }
  }
  return filters
})
</script>

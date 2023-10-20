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
import { useDayjs } from '#imports'
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
const fields = inject<Field[]>('fieldsList')
const mainData = ref<MainData>()

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

const removeFilter = (filter: Filter) => {
  let key = `filters[${filter.querySign}${filter.field.replace('[]', '')}]`
  if (filter.field.endsWith('[]')) key += '[]'
  const query = {
    ...route.query,
  }
  delete query[key]
  router.replace({
    query,
  })
}

const getAllPrefixAndSuffixPattern = computed(() => {
  const allPrefix = mainData.value?.comparatorTypes.map((comparator) => comparator.prefix) ?? []
  const allSuffix = mainData.value?.comparatorTypes.map((comparator) => comparator.suffix) ?? []
  return [...new Set([...allPrefix, ...allSuffix])]
})

const optionsRegrouped = (): { name: string; label: { label: string; value: string }[]; type: string }[] => {
  // Initialize an empty object to store the results
  const result: { [key: string]: { label: string; value: string }[] } = {}
  const options = mainData.value?.rightSelect.options ?? []
  for (const item of options) {
    if (!item.header && item.group) {
      if (!result[item.group]) {
        result[item.group] = []
      }
      result[item.group].push({ label: item.label, value: item.value! })
    }
  }

  return Object.keys(result).map((key) => {
    return {
      name: key,
      label: result[key],
      type: 'multiple',
    }
  })
}

const getAllFields = () => {
  const rightSelectOptions = optionsRegrouped()
  return [...fields, ...rightSelectOptions]
}

const getLabelByName = (name: string) => {
  const field = getAllFields().find((field) => field.name === name)
  if (!field) return name.replace('[]', '')
  if (field.type !== 'multiple') return (field.label as string).replace('[]', '')
  return field.name.replace('[]', '')
}

// Return the label for a comparator based on the comparator's query sign
const getComparatorLabel = (comparator: string) => {
  const comparatorObj = mainData.value?.comparatorTypes.find((comparatorObj) => comparatorObj.querySign === comparator)
  if (!comparatorObj) return comparator
  return comparatorObj.label.toLowerCase()
}

const getSearchString = (search: LocationQueryValue | LocationQueryValue[], fieldLabel: string) => {
  const field = getAllFields().find((field) => field.name === fieldLabel.replace('[]', ''))
  if (!field) return ''
  if (field.type === 'multiple') {
    const searchArray = Array.isArray(search) ? search : [search]
    return searchArray
      .map((search) => {
        const option = (field.label as { label: string; value: string }[]).find((option) => option.value.toString() === search.toString())
        if (!option) return search
        return option.label
      })
      .join(' ou ')
  }
  if (Array.isArray(search)) {
    return search.join(' ou ')
  }
  if (field?.type === 'date') {
    return dayjs(search).format('DD/MM/YYYY')
  }
  return sanitizeSearchString(search!.toString())
}

// This function sanitizes a search string by removing all prefixes and suffixes from the search string.

// The function takes a search string and returns a sanitized search string.
const sanitizeSearchString = (search: string) => {
  const allPrefixAndSuffixPattern = getAllPrefixAndSuffixPattern.value
  for (const pattern of allPrefixAndSuffixPattern) {
    search = search.replace(pattern, '')
  }
  return search
}

/**
 * This function extracts the comparator and field from a key.
 * @param {string} key - The key to extract the comparator and field from.
 * @returns {object} The extracted comparator and field, or null if the key does not start with a comparator.
 */

const extractComparator = (
  key: string,
): {
  comparator: string
  field: string
} | null => {
  const match = key.match(/^(\=|\?|\#|\!|\>|\<|\^|\@)+/)
  if (!match) return null
  const comparator = match[0]
  const field = key.replace(comparator, '')
  return {
    comparator,
    field,
  }
}

// This code extracts the filters from the route query and returns them as a computed object

const filterArray = computed(() => {
  const queries = { ...route.query }
  const filters: Record<string, { label: string; field: string; comparator: string; querySign: string; search: string }> = {}
  for (const key in queries) {
    if (queries.hasOwnProperty(key) && key.includes('filter')) {
      const filteredKey = key.replace('filters[', '').replace(']', '')
      const extract = extractComparator(filteredKey)
      if (!extract) continue
      const { comparator, field } = extract
      const label = getLabelByName(field)
      const search = getSearchString(queries[key], field)
      if (!label || !search || search === '') continue

      filters[key] = {
        label: getLabelByName(field),
        field,
        comparator: getComparatorLabel(comparator),
        querySign: comparator,
        search: getSearchString(queries[key], field),
      }
    }
  }
  return filters
})
</script>

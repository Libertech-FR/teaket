<template lang="pug">
q-select(
  :options="options"
  multiple hide-selected
  emit-value use-chips
  options-dense map-options 
  :model-value="filters"
  :option-value="(item) => item"
  :label="`Etats: ${filters.length} filtre(s) appliqué(s)`"
)
  template(v-slot:option="{ index, itemProps, opt, selected, toggleOption }")
    q-item-label(v-bind="itemProps" v-if="opt.header" header) {{ opt.label }}
    q-item(v-bind="itemProps" v-else @click.capture='addFilter({index, value: opt})')
      q-item-section(side)
        q-icon(:name="opt.icon" :color="opt.color" size="xs")
      q-item-section
        q-item-label(v-html="opt.label")
      q-item-section(side)
        q-toggle(:model-value="selected" @update:model-value="toggleOption")

</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import type { Ref } from 'vue'
import { useHttpApi, pushQuery } from "~/composables";

import type { components } from '#build/types/service-api'
import { useRoute, useRouter } from 'nuxt/app';
import { ticketType, lifeSteps } from "#imports";
type Category = components['schemas']['CategoriesDto']
type State = components['schemas']['StatesDto']

type Option = {
  label: string
  value?: string
  group?: string
  header?: boolean
  icon?: string
  color?: string
}
const route = useRoute()
const router = useRouter()

const { data: statesData } = inject('stateFetch')
const { data: categoriesData } = inject('categoriesFetch')

onMounted(() => {
  getFilters()
})

watch(() => route.query, () => {
  filters.value = []
  getFilters()
})

// const getFilters = () => {
//   const query = { ...route.query }
//   for (const key in query) {
//     if (key.startsWith('filters[@') && query[key] !== null) {
//       const values = query[key]
//       if (Array.isArray(values)) {
//         for (const value of values) {
//           const option = options.value.find(option => option.value === value)
//           if (option) {
//             filters.value.push(option)
//           }
//         }
//       } else {
//         const option = options.value.find(option => option.value === values)
//         if (option) {
//           filters.value.push(option)
//         }
//       }
//     }
//   }
// }

const getFilters = () => {
  // Use destructuring assignment to clone the route.query object
  const query = { ...route.query };

  // Use a functional approach with filter and map for better readability
  let group: string
  const filteredOptions = Object.entries(query)
    .filter(([key, value]) => key.startsWith('filters[@') && value !== null)
    .map(([key, value]) => {
      group = key.replace('filters[@', '').replace(']', '').replace('[]', '')
      return Array.isArray(value) ? value : [value]
    })
    .flat()
    .map(value => options.value.find(option => option.value?.toString() === value?.toString() && option.group === group))
    .filter(option => option !== undefined);
  filters.value = filteredOptions;
}


const filters = ref<Option[]>([])
const options = computed(() => {
  // const categories: Option[] = categoriesData.value.data.map((category: Category) => {
  //     return {
  //         label: category.name,
  //         value: category._id,
  //         group: 'categories'
  //     }
  // }) ?? []
  // categories.unshift({ label: 'Catégories', header: true })
  const ticketTypeOptions: Option[] = ticketType.map((type) => {
    return {
      label: type.label,
      value: type.value.toString(),
      group: 'type',
      icon: type.icon,
      color: type.color
    }
  })
  ticketTypeOptions.unshift({ label: 'Types', header: true })
  const states: Option[] = statesData.value.data.map((state: State) => {
    return {
      label: state.name,
      value: state._id,
      group: 'state.id',
      icon: state.icon ?? '',
      color: state.color ?? ''
    }
  }) ?? []
  if (!states.find(state => state.header)) states.unshift({ label: 'États', header: true })
  if (!lifeSteps.find(lifestepstep => lifestepstep.header)) lifeSteps.unshift({ label: 'Étapes de vie', header: true })
  return [
    ...lifeSteps,
    ...ticketTypeOptions,
    // ...categories,
    ...states
  ]
})

const regroupFilters = async () => {
  return filters.value.reduce((acc: any, filter: Option) => {
    const key = `filters[@${filter.group}]`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(filter.value)
    return acc
  }, {})
}

// const pushQuery = async () => {
//   const query = { ...route.query };
//   const regroupedFilters = await regroupFilters();

//   const keysToDelete = new Set<string>();

//   for (const key in query) {
//     if (key.startsWith('filters[@')) {
//       keysToDelete.add(key);
//     }
//   }

//   keysToDelete.forEach((keyToDelete) => {
//     delete query[keyToDelete];
//   });

//   for (const key in regroupedFilters) {
//     const values = regroupedFilters[key];
//     const length = values.length;
//     const keyWithBrackets = `${key}[]`;
//     if (length === 1) {
//       query[keyWithBrackets] = values;
//     } else {
//       if (query[keyWithBrackets]) {
//         delete query[keyWithBrackets];
//       }
//       query[key] = values;
//     }
//   }

//   router.push({
//     query
//   })
// };

const pushQueries = async () => {
  const regroupedFilters = await regroupFilters();
  for (const key in regroupedFilters) {
    const values = regroupedFilters[key];
    for (const value of values) {
      pushQuery({ value, key, multiple: true })
    }
  }
};

const addFilter = (option: { index: number, value: Option }) => {
  const index = filters.value.findIndex(filter => filter.value?.toString() === option.value.toString() && filter.group === option.value.group)
  if (index === -1) {
    filters.value.push(option.value)
  } else {
    filters.value.splice(index, 1)
  }
  pushQueries()
}

defineExpose({
  options,
})
</script>

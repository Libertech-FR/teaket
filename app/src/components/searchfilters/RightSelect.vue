<template lang="pug">
q-select(
  :options="options"
  multiple
  emit-value
  map-options
  :model-value="filters"
  :option-value="(item) => item"
  :label="`Etats: ${filters.length} filtre(s) appliqué(s)`"
  options-dense
  use-chips
  hide-selected
  @add="addFilter($event)"
  @remove="removeFilter($event)"
)
    template(v-slot:option="{ index, itemProps, opt, selected, toggleOption }")
      q-item-label(v-bind="itemProps" v-if="opt.header" header) {{ opt.label }}
      //@click.capture='addFilter({index, value: opt})'
      q-item(v-bind="itemProps" v-else)
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
import { useHttpApi } from "~/composables/useHttpApi";
import type { components } from '#build/types/service-api'
import { useRoute, useRouter } from 'nuxt/app';

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
const ticketType: {
  label: string,
  value: number,
  icon: string,
  color: string
}[] | undefined = inject('ticketType')
onMounted(() => {
  getFilters()
})

watch(() => route.query, () => {
  filters.value = []
  getFilters()
})

const getFilters = () => {
  const query = { ...route.query }
  for (const key in query) {
    if (key.startsWith('filters[@') && query[key] !== null) {
      const values = query[key]
      if (Array.isArray(values)) {
        for (const value of values) {
          const option = options.value.find(option => option.value === value)
          if (option) {
            filters.value.push(option)
          }
        }
      } else {
        const option = options.value.find(option => option.value === values)
        if (option) {
          filters.value.push(option)
        }
      }
    }
  }
}


const filters = ref<Option[]>([])
const lifeSteps = ref<Option[]>([
  { label: 'Lifestep', header: true },
  { label: 'Ouvert', value: '1', group: 'lifestep', icon: 'mdi-circle', color: "green" },
  { label: 'Clos', value: '0', group: 'lifestep', icon: 'mdi-circle', color: "red" },
])

const options = computed(() => {
  // const categories: Option[] = categoriesData.value.data.map((category: Category) => {
  //     return {
  //         label: category.name,
  //         value: category._id,
  //         group: 'categories'
  //     }
  // }) ?? []
  // categories.unshift({ label: 'Catégories', header: true })
  const ticketTypeOptions: Option[] = ticketType.value.map((type) => {
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
  states.unshift({ label: 'États', header: true })
  return [
    ...lifeSteps.value,
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

const pushQuery = async () => {
  const query = { ...route.query };
  const regroupedFilters = await regroupFilters();

  const keysToDelete = new Set<string>();

  for (const key in query) {
    if (key.startsWith('filters[@')) {
      keysToDelete.add(key);
    }
  }

  keysToDelete.forEach((keyToDelete) => {
    delete query[keyToDelete];
  });

  for (const key in regroupedFilters) {
    const values = regroupedFilters[key];
    const length = values.length;

    if (length === 1) {
      query[`${key}[]`] = values;
    } else {
      const keyWithBrackets = `${key}[]`;
      if (query[keyWithBrackets]) {
        delete query[keyWithBrackets];
      }
      query[key] = values;
    }
  }

  router.push({
    query
  })
};

const addFilter = (option: { index: number, value: Option }) => {
  filters.value.push(option.value)
  pushQuery()
}


const removeFilter = (option: { index: number, value: Option }) => {
  filters.value.splice(option.index, 1)
  pushQuery()
}

defineExpose({
  options,
})
</script>

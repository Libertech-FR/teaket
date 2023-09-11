<template lang="pug" @keypress="addFilter">
.q-ma-sm
    .row.q-gutter-sm.items-center
        .col.col-md-2
            q-select(:options="fieldTypes" label="Type de champ" v-model="fieldType" clearable @update:model-value="clearFields(['field', 'comparator'])")
        .col.col-md-2
            q-select(:options="fieldsFilteredByType" label="Champs" v-model="field" clearable @update:model-value="clearFields(['comparator'])")
        .col.col-md-2
            q-select(:options="comparatorFilteredByType" label="Comparateurs" v-model="comparator" clearable @update:model-value="clearFields([])")
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
            q-input(v-model="search" label="Rechercher" clearable :type="searchInputType" :prefix="comparator?.prefix" :suffix="comparator?.suffix")
                template(v-slot:append)


        .col-6.col-md-2(v-show="comparator?.multiplefields")
            q-input(v-model="searchMin" label="Min" clearable :type="searchInputType")
        .col-6.col-md-2(v-show="comparator?.multiplefields")
            q-input(v-model="searchMax" label="Max" clearable :type="searchInputType")
        .col-12.col-md-1
            q-btn(color="primary" @click="addFilter") Ajouter
        .col-12.col-md-1
            tk-SearchfiltersRightSelect
    //Filters chips
    .row.q-gutter-sm.items-center.q-mt-sm
        q-chip(
            v-for="filter in filterArray" :key="filter.field" 
            removable @remove="removeFilter(filter)"
        ) {{ filter.label }} {{ filter.comparator }} {{ filter.search }}
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { PropType } from 'vue'
import { useRouter, useRoute } from 'nuxt/app'
import { useDayjs } from '#imports';

const dayjs = useDayjs()

type Filter = {
    field: string
    comparator: string
    search: string
}

type Field = {
    name: string
    label: string
    type: string
}

type Comparator = {
    label: string
    querySign: string
    value: string
    icon: string
    type: string[]
    multiplefields: boolean
    prefix: string
    suffix: string
}

type SearchFilter = {
    field: Field
    comparator: Comparator
    search: string
    searchMin: string
    searchMax: string
}

const props = defineProps({
    fields: {
        type: Array as PropType<Field[]>,
        required: true
    }
})

const router = useRouter()
const route = useRoute()

const inclus = ref(true)
const fieldType = ref<{
    label: string
    value: string
}>()

let field = ref<Field>()
let comparator = ref<Comparator>()
const search = ref('')
const searchMin = ref('')
const searchMax = ref('')


const filters = ref<Filter[]>([])

const fieldTypes = ref<{
    label: string
    value: string
}[]>([
    { label: 'Texte', value: 'text' },
    { label: 'Nombre', value: 'number' },
    { label: 'Date', value: 'date' },
])

const comparatorTypes = ref<Comparator[]>([
    { label: 'Egal', querySign: '=', value: '=', icon: 'mdi-equal', type: ['number'], multiplefields: false, prefix: '', suffix: '' },
    { label: 'Différent', querySign: '!=', value: '!=', icon: 'mdi-exclamation', type: ['number'], multiplefields: false, prefix: '', suffix: '' },
    { label: 'Est supérieur à', querySign: '>', value: '>', icon: 'mdi-greater-than', type: ['number', 'date'], multiplefields: false, prefix: '', suffix: '' },
    { label: 'Est supérieur ou égal à', querySign: '>=', value: '>=', icon: 'mdi-greater-than-or-equal', type: ['number', 'date'], multiplefields: false, prefix: '', suffix: '' },
    { label: 'Est inférieur à', querySign: '<', value: '<', icon: 'mdi-less-than', type: ['number', 'date'], multiplefields: false, prefix: '', suffix: '' },
    { label: 'Est inférieur ou égal à', querySign: '<=', value: '<=', icon: 'mdi-less-than-or-equal', type: ['number', 'date'], multiplefields: false, prefix: '', suffix: '' },
    { label: 'Est entre', querySign: '<<', value: 'between', icon: 'mdi-arrow-expand-horizontal', type: ['number', 'date'], multiplefields: true, prefix: '', suffix: '' },
    { label: 'Contiens', querySign: '^', value: '^', icon: 'mdi-apple-keyboard-control', type: ['text'], multiplefields: false, prefix: '/', suffix: '/' },
    { label: 'Commence par', querySign: '^', value: '/^', icon: 'mdi-apple-keyboard-control', type: ['text'], multiplefields: false, prefix: '/^', suffix: '/' },
    { label: 'Fini par', querySign: '^', value: '$/', icon: 'mdi-apple-keyboard-control', type: ['text'], multiplefields: false, prefix: '/', suffix: '$/' },
])

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
            await pushQuery(key, value)
        }
    } else {
        const { key, value } = parseSimpleFilter(searchFilter)
        await pushQuery(key, value)
    }
}

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

const parseMultipleFilter = (searchFilter: SearchFilter) => {
    if (searchFilter.field.type === 'date') {
        searchFilter.searchMin = dayjs(searchFilter.searchMin).startOf('day').toISOString()
        searchFilter.searchMax = dayjs(searchFilter.searchMax).endOf('day').toISOString()
    }
    const min = {
        key: `filters[>=${searchFilter.field.name}]`,
        value: `${searchFilter.comparator.prefix}${searchFilter.searchMin}${searchFilter.comparator.suffix}`
    }
    const max = {
        key: `filters[<=${searchFilter.field.name}]`,
        value: `${searchFilter.comparator.prefix}${searchFilter.searchMax}${searchFilter.comparator.suffix}`
    }
    return [min, max]
}

const pushQuery = async (key: string, value: string) => {
    const query = {
        ...route.query,
    }
    query[key] = value
    await router.push({
        query
    })
}

const removeFilter = (filter: Filter) => {
    const key = `filters[${filter.comparator}${filter.field}]`
    const query = {
        ...route.query,
    }
    delete query[key]
    router.push({
        query
    })
}

const getLabelByName = (name: string) => {
    const field = props.fields.find(field => field.name === name)
    if (!field) return ''
    return field.label
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

const getSearchFilter = computed(() => {
    if (field.value === undefined || field.value === null) return null
    if (comparator.value === undefined || comparator.value === null) return null
    return {
        field: field!.value,
        comparator: comparator!.value,
        search: search.value,
        searchMin: searchMin.value,
        searchMax: searchMax.value
    }
})

const filterArray = computed(() => {
    const queries = { ...route.query }
    const filters: Record<string, { label: string, field: string, comparator: string, search: string }> = {};

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
                comparator,
                search: queries[key]?.toString() ?? ''
            };
        }
    }
    return filters
})

const searchInputType = computed(() => {
    if (fieldType.value === undefined || fieldType.value === null) return 'text'
    return fieldType.value!.value
})

const fieldsFilteredByType = computed(() => {
    if (fieldType.value === undefined || fieldType.value === null) return []
    return props.fields.filter((field) => {
        return field.type === fieldType.value!.value
    })
})

const comparatorFilteredByType = computed(() => {
    if (fieldType.value === undefined || fieldType.value === null) return []
    return comparatorTypes.value.filter((comparator) => {
        return comparator.type.includes(fieldType.value!.value)
    })
})
</script>
<template lang="pug">
.q-pa-sm(@keydown.enter="addFilter")
    .row.q-gutter-sm.items-center
        .col-1
            q-toggle(v-model="inclus" :label="inclus ? 'Inclus' : 'Exclus'") 
        .col-1
            q-select(:options="fieldTypes" label="Type de champ" v-model="fieldType")
        .col-2
            q-select(:options="fields" label="Champs" v-model="field")
        .col-1
            q-select(:options="comparatorTypes" label="Comparateurs" v-model="comparator")
                template(v-slot:selected-item="scope")
                    q-icon(:name="scope.opt.icon" size="xs")

                template(v-slot:option="scope")
                    q-item(v-bind="scope.itemProps")
                        q-item-section(avatar)
                            q-icon(:name="scope.opt.icon")
                        q-item-section
                            q-item-label
                                span {{ scope.opt.label }}

        .col-2
            q-input(v-model="search" label="Rechercher")
        .col-2
            q-btn(flat icon="mdi-plus" color="primary" @click="addFilter")
                q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Ajouter

    //Filters chips
    .row.q-gutter-sm.items-center.q-mt-sm
        q-chip(
            v-for="filter in filterArray" :key="filter.field" 
            removable @remove="removeFilter(filter)"
        ) {{ filter.label }} {{ filter.comparator }} {{ filter.search }}
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { PropType } from 'vue'
import { useRouter, useRoute } from 'nuxt/app'

type Filter = {
    field: string
    comparator: string
    search: string
}

type Field = {
    name: string
    label: string
}

type Comparator = {
    label: string
    value: string
    icon: string
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
const fieldType = ref('')
let field = ref<Field>()
let comparator = ref<Comparator>()
const search = ref('')

const filters = ref<Filter[]>([])

const fieldTypes = ref([
    { label: 'Texte', value: 'text' },
    { label: 'Nombre', value: 'number' },
    { label: 'Date', value: 'date' },
    { label: 'Heure', value: 'time' },
    { label: 'Date et heure', value: 'datetime' },
    { label: 'Liste', value: 'list' },
    { label: 'Liste de valeurs', value: 'listOfValues' },
    { label: 'Liste de valeurs multiples', value: 'listOfValuesMultiple' },
])

const comparatorTypes = ref<Comparator[]>([
    { label: 'Egal', value: '=', icon: 'mdi-equal' },
    { label: 'Différent', value: '!=', icon: 'mdi-exclamation' },
    { label: 'Est supérieur à', value: '>', icon: 'mdi-greater-than' },
    { label: 'Est supérieur ou égal à', value: '>=', icon: 'mdi-greater-than-or-equal' },
    { label: 'Est inférieur à', value: '<', icon: 'mdi-less-than' },
    { label: 'Est inférieur ou égal à', value: '<=', icon: 'mdi-less-than-or-equal' },
    { label: 'Est entre', value: 'between', icon: 'mdi-arrow-expand-horizontal' },
])

const addFilter = () => {
    if (
        !field.value ||
        !comparator.value ||
        !search.value
    ) return

    const object = {
        field: field.value.name,
        comparator: comparator.value.value,
        search: search.value
    }
    const key = `filter[${object.comparator}${object.field}]`
    const value = object.search
    const query = {
        ...route.query,
    }
    query[key] = value
    router.push({
        query
    })
}

const removeFilter = (filter: Filter) => {
    const key = `filter[${filter.comparator}${filter.field}]`
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
    if (!field) return
    return field.label
}


const exctractComparator = (key: string): {
    comparator: string
    field: string
} | null => {
    const match = key.match(/^(\=|\?|\#|\!|\>|\<|\^|\@)+/)
    if (!match) return
    const comparator = match[0]
    const field = key.replace(comparator, '')
    return {
        comparator,
        field
    }
}

const filterArray = computed(() => {
    const queries = { ...route.query }
    const filters: Record<string, string> = {};

    // Iterate through the keys and values in the input object
    for (const key in queries) {
        if (queries.hasOwnProperty(key) && key.includes("filter")) {

            // Extract the key without the "filter[" and "]" parts
            const filteredKey = key.replace("filter[", "").replace("]", "");
            const exctract = exctractComparator(filteredKey)
            if (!exctract) continue
            const { comparator, field } = exctract
            // Assign the value to the extracted key in the filter array
            filters[field] = {
                label: getLabelByName(field),
                field,
                comparator,
                search: queries[key]
            };
        }
    }
    return filters
})
</script>
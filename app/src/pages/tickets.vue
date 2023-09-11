
<template lang="pug">
div
    .q-pa-md
        tk-searchfilters(:fields="fieldsList")
    .q-pa-md
        q-table(
            :rows="data?.data" :rows-per-page-options="[5, 10, 15]" :loading="pending" :columns="columns" row-key="id" :visible-columns="visibleColumns"
            v-model:pagination="pagination" title="Tickets" @request="onRequest"
            rows-per-page-label="Lignes par page" no-data-label="Aucune donnée" loading-label="Chargement..." no-results-label="Aucun résultat"
            :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} sur ${totalRowsNumber} lignes`"
        )
            template(v-slot:top)
                q-space
                q-btn(flat fab icon="mdi-eye" color="primary")
                    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher/cacher
                    q-menu(max-width="350px" max-height="350px").q-pa-md
                        .row
                            .col-6(v-for="column in columns" :key="column.value")
                                q-toggle(v-model="visibleColumns" :label="column.label" :val="column.name")
                q-btn(flat fab icon="mdi-refresh" @click="refresh" color="primary")
                    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Rafraichir
                q-btn(icon="mdi-plus" color="primary" @click="$router.push('/tickets/create')") Créer


    
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useHttpApi } from "~/composables/useHttpApi";
import { computed, useDayjs, onMounted } from "#imports";
import type { QTableProps } from "quasar";
import { useRoute, useRouter } from "nuxt/app";
import type { components } from '#build/types/service-api'

type Ticket = components["schemas"]['TicketDto']

const daysjs = useDayjs()
const route = useRoute()
const router = useRouter()


onMounted(() => {
    pagination.value!.rowsNumber = getTotalRowsNumber.value
    const query = { ...route.query }
    const limit = query.limit ?? 10
    const skip = query.skip ?? 0
    pagination.value!.rowsPerPage = parseInt(limit as string)
    pagination.value!.page = parseInt(skip as string) / parseInt(limit as string) + 1

    let sortKey = 'updatedAt'
    let sortDirection = 'desc'
    for (const key in query) {
        if (key.startsWith('sort')) {
            sortKey = key.replace('sort[', '').replace(']', '')
            sortDirection = query[key] === 'desc' ? 'desc' : 'asc'
        }
    }
    pagination.value!.sortBy = sortKey
    pagination.value!.descending = sortDirection === 'desc'
    paginationQuery()
})

const columns = ref<QTableProps['columns']>([
    {
        name: 'sequence',
        label: 'ID',
        field: 'sequence',
        align: 'left',
        sortable: true,
    },
    {
        name: 'envelope.senders.name',
        label: 'Appelant',
        field: (row: Ticket) => row.envelope.senders.length > 0 ? row.envelope.senders[0].name : '',
        align: 'left',
        sortable: true
    },
    {
        name: 'envelope.observers.name',
        label: 'Concerné',
        field: (row: Ticket) => row.envelope.observers.length > 0 ? row.envelope.observers[0].name : '',
        align: 'left',
        sortable: true
    },
    {
        name: 'envelope.assigned.name',
        label: 'Assigné',
        field: (row: Ticket) => row.envelope.assigned.length > 0 ? row.envelope.assigned[0].name : '',
        align: 'left',
        sortable: true
    },
    {
        name: 'subject',
        label: 'Sujet',
        field: 'subject',
        align: 'left',
        sortable: true
    },
    {
        name: 'updatedAt',
        label: 'Date de modification',
        field: (row: Ticket) => row.metadata.lastUpdatedAt,
        format: (val: string) => daysjs(val).format('DD/MM/YYYY HH:mm'),
        align: 'left',
        sortable: true,
    },
    {
        name: 'createdAt',
        label: 'Date de création',
        field: (row: Ticket) => row.metadata.createdAt,
        format: (val: string) => daysjs(val).format('DD/MM/YYYY HH:mm'),
        align: 'left',
        sortable: true
    },
    // {
    //     name: 'actions',
    //     label: 'Date de modification',
    //     field: 'actions',
    //     align: 'left',
    //     sortable: true
    // },
    // {
    //     name: 'actions',
    //     label: 'Etat de vie',
    //     field: 'actions',
    //     align: 'left',
    //     sortable: true
    // },
    // {
    //     name: 'actions',
    //     label: 'Statut',
    //     field: 'actions',
    //     align: 'left',
    //     sortable: true
    // },
])
const visibleColumns = ref<QTableProps['visibleColumns']>(['sequence', 'envelope.senders.name', 'envelope.observers.name', 'envelope.assigned.name', 'subject', 'updatedAt', 'createdAt'])
const columnsType = ref([
    { name: 'sequence', type: 'text' },
    { name: 'envelope.senders.name', type: 'text' },
    { name: 'envelope.observers.name', type: 'text' },
    { name: 'envelope.assigned.name', type: 'text' },
    { name: 'subject', type: 'text' },
    { name: 'updatedAt', type: 'date' },
    { name: 'createdAt', type: 'date' },
    { name: 'actions', type: 'text' },
    { name: 'actions', type: 'text' },
    { name: 'actions', type: 'text' },
])

const { data, pending, error, refresh } = useHttpApi('tickets/ticket', {
    method: 'get',
    query: computed(() => ({
        ...route.query,
    }))
})

const getTotalRowsNumber = computed(() => {
    return data.value?.total ?? 0
})

const pagination = ref<QTableProps['pagination']>({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 10,
    sortBy: 'updatedAt',
    descending: true
})

const onRequest = (props: any) => {
    const { page, rowsPerPage, sortBy, descending } = props.pagination
    pagination.value!.rowsNumber = getTotalRowsNumber.value
    pagination.value!.page = page
    pagination.value!.rowsPerPage = rowsPerPage
    pagination.value!.sortBy = sortBy
    pagination.value!.descending = descending
    paginationQuery()
}

const paginationQuery = () => {
    const query = removeSortKey()
    const skip = `${(pagination.value?.page! - 1) * pagination.value?.rowsPerPage!}`
    const limit = `${pagination.value?.rowsPerPage!}`
    let sortBy = pagination.value?.sortBy!
    if (sortBy === null) {
        sortBy = 'updatedAt'
    }

    const sortKey = `sort[${sortBy}]`
    const sortDirection = pagination.value?.descending! ? `desc` : `asc`

    query[sortKey] = sortDirection
    query['skip'] = skip
    query['limit'] = limit
    router.push({
        query
    })
}

const removeSortKey = () => {
    const query = { ...route.query }
    for (const key in query) {
        if (key.startsWith('sort[')) {
            delete query[key]
        }
    }
    return query
}

const fieldsList = computed(() => {
    return columns.value!.reduce(
        (acc: { name: string, label: string, type?: string }[], column) => {
            if (visibleColumns.value!.includes(column.name)) {
                const type = columnsType.value.find(type => type.name === column.name)?.type
                acc.push({
                    name: column.name,
                    label: column.label,
                    type
                })
            }
            return acc
        },
        []
    )
})


</script>
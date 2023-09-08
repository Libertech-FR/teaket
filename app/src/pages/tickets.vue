
<template lang="pug">
div
    .q-pa-md
        tk-SearchFilters(:fields="fieldsList")
    .q-pa-md
        q-table(
            :rows="data?.data" :rows-per-page-options="[5, 10, 15]" :loading="pending" :columns="columns" row-key="id" :visible-columns="visibleColumns"
            v-model:pagination="pagination" @update:pagination="paginationQuery($event)" title="Tickets" @request="onRequest"
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
import { useApiFetch } from "../composables/useApiFetch";
import { computed, useDayjs } from "#imports";
import type { QTableProps } from "quasar";
import type { schemas } from "../composables/useApiFetch";
import { useRoute, useRouter } from "nuxt/app";

type Ticket = schemas['TicketDto']

const daysjs = useDayjs()
const route = useRoute()
const router = useRouter()
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
        field: (row: Ticket) => row.envelope.senders[0].name,
        align: 'left',
        sortable: true
    },
    {
        name: 'envelope.observers.name',
        label: 'Concerné',
        field: (row: Ticket) => row.envelope.observers[0].name,
        align: 'left',
        sortable: true
    },
    {
        name: 'envelope.assigned.name',
        label: 'Assigné',
        field: (row: Ticket) => row.envelope.assigned[0].name,
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

const { data, pending, error, refresh } = useApiFetch('tickets/ticket', {
    method: 'GET',
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
    sortBy: 'sequence',
    descending: false
})

const onRequest = (request: any) => {
    const newPagination = { ...request.pagination }
    newPagination.rowsNumber = getTotalRowsNumber.value
    pagination.value = newPagination
    paginationQuery(newPagination)
}

const paginationQuery = (pagination: QTableProps['pagination']) => {
    const skip = (pagination?.page! - 1) * pagination?.rowsPerPage!
    const limit = pagination?.rowsPerPage!
    router.push({
        query: {
            ...route.query,
            skip,
            limit,
        }
    })
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
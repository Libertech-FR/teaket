
<template lang="pug">
div
    .q-pa-md.q-d-flex
        tk-SearchFilters(:fields="fieldsList")
    .q-pa-md
        q-table(:rows="data?.data" :rows-per-page-options="[5, 10, 15]" :loading="pending" :columns="columns" row-key="id" :visible-columns="visibleColumns")
            template(v-slot:top)
                span Tickets
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
import type { schemas } from "../composables/useApiFetch";

type Ticket = schemas['TicketDto']

const daysjs = useDayjs()
const columns = ref([
    {
        name: 'sequence',
        label: 'ID',
        field: 'sequence',
        align: 'left',
        sortable: true
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
        field: (row: any) => row.metadata.lastUpdatedAt,
        format: (val: any) => daysjs(val).format('DD/MM/YYYY HH:mm'),
        align: 'left',
        sortable: true,
    },
    {
        name: 'createdAt',
        label: 'Date de création',
        field: (row: any) => row.metadata.createdAt,
        format: (val: any) => daysjs(val).format('DD/MM/YYYY HH:mm'),
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

const fieldsList = computed(() => {
    // return columns.value.filter((column: any) => {
    //     return visibleColumns.value.includes(column.name)
    // })

    return columns.value.reduce(
        (acc: any, column: any) => {
            if (visibleColumns.value.includes(column.name)) {
                acc.push({
                    name: column.name,
                    label: column.label,
                })
            }
            return acc
        },
        []
    )
})

const visibleColumns = ref(['sequence', 'senders', 'observers', 'assigned', 'subject', 'updatedAt', 'createdAt'])
const { data, pending, error, refresh } = useApiFetch('tickets/ticket')

</script>
<template lang="pug">
q-page
  .q-pa-md
    tk-searchfilters(:fields="fieldsList")
  .q-pa-md
    q-table.tk-sticky-last-column-table(
      :rows="tickets?.data"
      :rows-per-page-options="[5, 10, 15]" :loading="pending" :columns="columns" row-key="_id" :visible-columns="visibleColumns"
      v-model:pagination="pagination" title="Tickets" @request="onRequest($event, tickets.total)"
      rows-per-page-label="Lignes par page" no-data-label="Aucune donnée" loading-label="Chargement..." no-results-label="Aucun résultat"
      :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} sur ${totalRowsNumber} lignes`"
      selection="multiple" v-model:selected="selected" :selected-rows-label="(numberOfRows) => `${numberOfRows} tickets sélectionnées`"
    )
      template(v-slot:top-left)
        tk-tickets-table-top-left(:selected="selected" @openDialog="closeTicketsDialog = true" @clear="selected = []")
      template(v-slot:top-right)
        tk-tickets-table-top-right(:columns="columns" v-model="visibleColumns" @refresh="refresh")
      template(v-slot:body-cell-actions="props")
        tk-tickets-table-actions(:ticket="props.row" @closeTicket="closeTicket($event)")

      template(v-slot:body-cell-states="props")
        tk-tickets-table-state-col(:ticket="props.row")

      template(v-slot:body-cell-envelope.senders.name="props")
        q-td(:props="props")
          span.q-ml-sm {{ props.row.envelope.senders.length === 0 ? "Pas d'appelant" : props.row.envelope.senders[0].name }}
          span(v-if="props.row.envelope.senders.length > 1") , {{ props.row.envelope.senders.length -1 }} autre{{ props.row.envelope.senders.length === 2 ? '' : 's'  }}...
            q-tooltip.text-body2(transition-show="scale" transition-hide="scale") ...{{ [...props.row.envelope.senders].slice(1).map(s => s.name).join(', ') }}

      template(v-slot:body-cell-envelope.observers.name="props")
        q-td(:props="props")
          span.q-ml-sm {{ props.row.envelope.observers.length === 0 ? "Pas de concerné" : props.row.envelope.observers[0].name }}
          span(v-if="props.row.envelope.observers.length > 1") , {{ props.row.envelope.observers.length -1 }} autre{{ props.row.envelope.observers.length === 2 ? '' : 's'  }}...
            q-tooltip.text-body2(transition-show="scale" transition-hide="scale") ...{{ [...props.row.envelope.observers].slice(1).map(s => s.name).join(', ') }}

      template(v-slot:body-cell-envelope.assigned.name="props")
        q-td(:props="props")
          span.q-ml-sm {{ props.row.envelope.assigned.length === 0 ? "Pas d'assigné" : props.row.envelope.assigned[0].name }}
          span(v-if="props.row.envelope.assigned.length > 1") , {{ props.row.envelope.assigned.length -1 }} autre{{ props.row.envelope.assigned.length === 2 ? '' : 's'  }}...
            q-tooltip.text-body2(transition-show="scale" transition-hide="scale") ...{{ [...props.row.envelope.assigned].slice(1).map(s => s.name).join(', ') }}

  tk-tickets-closeDialog(v-model="closeTicketsDialog" :selected="selected" @refresh="refresh")
</template>

<script lang="ts" setup>
import usePagination from '~/composables/usePagination'
import { ref, provide, watch, computed } from 'vue'
import { useHttpApi } from '~/composables/useHttpApi'
import { useDayjs, onMounted } from '#imports'
import { useRoute, useRouter } from 'nuxt/app'
import { useQuasar } from 'quasar'
import type { QTableProps } from 'quasar'
import type { components } from '#build/types/service-api'
import useCloseTicket from '~/composables/useCloseTicket'
type Ticket = components['schemas']['TicketDto']
type State = components['schemas']['StatesDto']

const daysjs = useDayjs()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const closeTicketsDialog = ref<boolean>(false)
const { pagination, onRequest, initializePagination } = usePagination()

const {
  data: tickets,
  pending,
  refresh,
  error,
} = await useHttpApi('/tickets/ticket', {
  method: 'get',
  query: computed(() => {
    return {
      ...route.query,
    }
  }),
})

if (tickets.value) {
  initializePagination(tickets.value.total)
}

if (error.value) {
  $q.notify({
    message: 'Impossible de récupérer les tickets',
    type: 'negative',
  })
}

const {
  data: categories,
  pending: categoriesPending,
  refresh: categoriesRefresh,
  error: categoriesError,
} = await useHttpApi('/core/categories', {
  method: 'get',
  query: {
    limit: 999,
  },
})

if (categoriesError.value) {
  $q.notify({
    message: 'Impossible de récupérer les catégories',
    type: 'negative',
  })
}
const {
  data: states,
  pending: statesPending,
  refresh: statesRefresh,
  error: statesError,
} = await useHttpApi('/tickets/state', {
  method: 'get',
  query: {
    limit: 999,
  },
})

if (statesError.value) {
  $q.notify({
    message: 'Impossible de récupérer les états',
    type: 'negative',
  })
}

const columns = ref<QTableProps['columns']>([
  {
    name: 'states',
    label: 'Etats',
    field: 'states',
    align: 'left',
  },
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
    field: (row: Ticket) => row.envelope.senders,
    align: 'left',
    sortable: true,
  },
  {
    name: 'envelope.observers.name',
    label: 'Concerné',
    field: (row: Ticket) => row.envelope.observers,
    align: 'left',
    sortable: true,
  },
  {
    name: 'envelope.assigned.name',
    label: 'Assigné',
    field: (row: Ticket) => row.envelope.assigned,
    align: 'left',
    sortable: true,
  },
  {
    name: 'subject',
    label: 'Sujet',
    field: 'subject',
    align: 'left',
    sortable: true,
  },
  {
    name: 'metadata.lastUpdatedAt',
    label: 'Date de modification',
    field: (row: Ticket) => row?.metadata?.lastUpdatedAt,
    format: (val: string) => daysjs(val).format('DD/MM/YYYY HH:mm'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'metadata.createdAt',
    label: 'Date de création',
    field: (row: Ticket) => row?.metadata?.createdAt,
    format: (val: string) => daysjs(val).format('DD/MM/YYYY HH:mm'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'left',
  },
])
const visibleColumns = ref<QTableProps['visibleColumns']>([
  'sequence',
  'envelope.senders.name',
  'envelope.observers.name',
  'envelope.assigned.name',
  'subject',
  'metadata.lastUpdatedAt',
  'metadata.createdAt',
  'actions',
  'states',
])
const columnsType = ref([
  { name: 'sequence', type: 'text' },
  { name: 'envelope.senders.name', type: 'text' },
  { name: 'envelope.observers.name', type: 'text' },
  { name: 'envelope.assigned.name', type: 'text' },
  { name: 'subject', type: 'text' },
  { name: 'metadata.lastUpdatedAt', type: 'date' },
  { name: 'metadata.createdAt', type: 'date' },
  { name: 'actions', type: 'text' },
  { name: 'actions', type: 'text' },
  { name: 'actions', type: 'text' },
])

const selected = ref<Ticket[]>([])
const { openDialog } = useCloseTicket()
function closeTicket(ticket: Ticket) {
  selected.value = [ticket]
  openDialog({ ticket: selected.value, refreshEvent: refresh })
}

const fieldsList = computed(() => {
  return columns.value!.reduce((acc: { name: string; label: string; type?: string }[], column) => {
    if (visibleColumns.value!.includes(column.name) && column.name !== 'actions' && column.name !== 'states') {
      const type = columnsType.value.find((type) => type.name === column.name)?.type
      acc.push({
        name: column.name,
        label: column.label,
        type,
      })
    }
    return acc
  }, [])
})

provide('fieldsList', fieldsList.value)
provide('stateFetch', { data: states, pending: statesPending, refresh: statesRefresh, error: statesError })
provide('categoriesFetch', { data: categories, pending: categoriesPending, refresh: categoriesRefresh, error: categoriesError })
</script>

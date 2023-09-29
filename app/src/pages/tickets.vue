
<template lang="pug">
q-page
  .q-pa-md
    tk-searchfilters(:fields="fieldsList")
  .q-pa-md
    q-table(
      :rows="tickets.data" :rows-per-page-options="[5, 10, 15]" :loading="pending" :columns="columns" row-key="_id" :visible-columns="visibleColumns"
      v-model:pagination="pagination" title="Tickets" @request="onRequest"
      rows-per-page-label="Lignes par page" no-data-label="Aucune donnée" loading-label="Chargement..." no-results-label="Aucun résultat"
      :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} sur ${totalRowsNumber} lignes`"
      selection="multiple" v-model:selected="selected" :selected-rows-label="(numberOfRows) => `${numberOfRows} tickets sélectionnées`"
    )
      template(v-slot:top)
        .col-12.col-sm
          q-btn-group(rounded flat)
            q-btn(icon="mdi-eye-check-outline" color="primary" rounded @click="markAsRead" size="md" :disable="selected.length === 0" primary)
              q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Marqué comme lu
            q-btn(flat icon="mdi-merge" color="primary" rounded @click="mergeTickets" size="md" :disable="selected.length === 0 || selected.length === 1")
              q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Fusionner les tickets sélectionnés
            q-btn(flat icon="mdi-eye" color="primary" rounded @click="goToTicket(selected[0])" size="md" :disable="selected.length === 0 || selected.length !== 1")
              q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher les tickets sélectionnés
            q-btn(flat icon="mdi-delete" color="primary" rounded @click="closeTicketsDialog = true" size="md" :disable="selected.length === 0")
              q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Cloturer les tickets sélectionnés
            q-btn(flat icon="mdi-close" color="primary" rounded @click="selected = []" size="md")
              q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Nettoyer la selection
        .col-12.col-sm.flex.justify-end
          q-btn-group(rounded flat)
            q-btn(flat icon="mdi-table-headers-eye" color="primary")
              q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher/cacher des colones
              q-menu(max-width="350px" max-height="350px").q-pa-md
                .row
                  .col-6(v-for="column in columns" :key="column.value")
                    q-toggle(v-model="visibleColumns" :label="column.label" :val="column.name")
            q-btn(flat icon="mdi-refresh" @click="refresh" color="primary")
              q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Rafraichir
            q-btn(icon="mdi-plus" color="primary" @click="$router.push('/tickets/create')") Créer

      template(v-slot:body-cell-actions="props")
        q-td(:props="props")
          q-btn-group(flat rounded)
            q-btn(icon="mdi-eye" color="primary" @click="goToTicket(props.row)" size="sm" flat)
              q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher le ticket
            q-btn(icon="mdi-delete" color="primary" @click="deleteTickets" size="sm" flat)
              q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Supprimer le ticket

      template(v-slot:body-cell-states="props")
        q-td(:props="props")
          q-icon(:name="getLifeStep(props.row.lifestep).icon" :color="getLifeStep(props.row.lifestep).color" size="xs").q-mx-xs
          q-icon(:name="getType(props.row.type).icon" :color="getType(props.row.type).color" size="xs").q-mx-xs
          q-icon(v-if="props.row.state && props.row.state.icon" :name="getState(props.row.state).icon" :color="getState(props.row.state).color" size="xs").q-mx-xs

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

  q-dialog(v-model="closeTicketsDialog")
    q-card.q-pa-sm
      q-card-section.row.items-center
        .col-12.text-h6.text-center
          | Voulez vous vraiment cloturer les tickets sélectionnés ?
      q-card-actions
        q-btn(color="red" label="Annuler" flat @click="closeTicketsDialog = false")
        q-btn(color="green" label="Confirmer" flat @click="closeTickets")
</template>

<script lang="ts" setup>
import { ref, provide } from "vue";
import { useHttpApi } from "~/composables/useHttpApi";
import { computed, useDayjs, onMounted } from "#imports";
import { useRoute, useRouter } from "nuxt/app";
import { useQuasar } from "quasar";
import type { QTableProps } from "quasar";
import type { components } from '#build/types/service-api'
import { ticketType, lifeSteps } from "#imports";
type Ticket = components["schemas"]['TicketDto']
type State = components["schemas"]['StatesDto']

const daysjs = useDayjs()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const closeTicketsDialog = ref<boolean>(false)
const { data: tickets, pending, refresh, error } = await useHttpApi('/tickets/ticket', {
  method: 'get',
  query: computed(() => {
    return {
      ...route.query,
    }
  })
})

if (error.value) {
  $q.notify({
    message: 'Impossible de récupérer les tickets',
    type: 'negative'
  })
}
const { data: categories, pending: categoriesPending, refresh: categoriesRefresh, error: categoriesError } = await useHttpApi('/core/categories', {
  method: 'get'
})

if (categoriesError.value) {
  $q.notify({
    message: 'Impossible de récupérer les catégories',
    type: 'negative'
  })
}
const { data: states, pending: statesPending, refresh: statesRefresh, error: statesError } = await useHttpApi('/tickets/state', {
  method: 'get'
})

if (statesError.value) {
  $q.notify({
    message: 'Impossible de récupérer les états',
    type: 'negative'
  })
}

onMounted(async () => {
  pagination.value!.rowsNumber = tickets.value?.total
  const query = { ...route.query }
  const limit = query.limit ?? 10
  const skip = query.skip ?? 0
  pagination.value!.rowsPerPage = parseInt(limit as string)
  pagination.value!.page = parseInt(skip as string) / parseInt(limit as string) + 1

  let sortKey = 'metadata.lastUpdatedAt'
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

const selected = ref<Ticket[]>([])
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
    sortable: true
  },
  {
    name: 'envelope.observers.name',
    label: 'Concerné',
    field: (row: Ticket) => row.envelope.observers,
    align: 'left',
    sortable: true
  },
  {
    name: 'envelope.assigned.name',
    label: 'Assigné',
    field: (row: Ticket) => row.envelope.assigned,
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
    sortable: true
  },
  // {
  //     name: 'actions',
  //     label: 'Etat de vie',
  //     field: 'actions',
  //     align: 'left',
  //     sortable: true
  // },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'left',
  },
])
const visibleColumns = ref<QTableProps['visibleColumns']>(['sequence', 'envelope.senders.name', 'envelope.observers.name', 'envelope.assigned.name', 'subject', 'metadata.lastUpdatedAt', 'metadata.createdAt', 'actions', 'states'])
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

const goToTicket = (ticket: Ticket) => {
  router.push(`/ticket/${ticket._id}`)
}

const pagination = ref<QTableProps['pagination']>({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
  sortBy: 'updatedAt',
  descending: true
})

const onRequest = async (props: QTableProps) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value!.rowsNumber = tickets.value?.total
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
      if (visibleColumns.value!.includes(column.name) && column.name !== 'actions' && column.name !== 'states') {
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

const getState = (stateParam: { id: string, name: string }) => {
  const findedState = states.value?.data.find((state: State) => {
    return state._id === stateParam.id
  })
  return findedState
}

const getType = (type: number) => {
  return ticketType.find(t => t.value === type)
}

const getLifeStep = (type: number) => {
  const lifeStep = lifeSteps.find(l => l.value === type)
  return lifeStep
}

const markAsRead = () => {
  console.log('markAsRead')
}

const mergeTickets = () => {
  console.log('mergeTickets')
}

const openCloseTicketsModale = () => {
  closeTicketsDialog.value = true
}

const closeTickets = async () => {
  const { data, error } = await useHttpApi('/tickets/ticket/close-many', {
    method: 'post',
    body: {
      ids: selected.value.map(s => s._id)
    }
  })
  if (error.value) {
    closeTicketsDialog.value = false
    $q.notify({
      message: 'Impossible de cloturer les tickets',
      type: 'negative'
    })
  } else {
    refresh()
    closeTicketsDialog.value = false
    $q.notify({
      message: 'Tickets cloturés',
      type: 'positive'
    })
  }
}

provide('fieldsList', fieldsList)
provide('stateFetch', { data: states, pending: statesPending, refresh: statesRefresh, error: statesError })
provide('categoriesFetch', { data: categories, pending: categoriesPending, refresh: categoriesRefresh, error: categoriesError })

</script>

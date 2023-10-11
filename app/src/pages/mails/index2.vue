<template lang="pug">
div
    q-card(flat)
      q-card-section(horizontal)
        q-card-section.full-width(:style="{maxWidth: '50vw', overflow: 'hidden'}")
          q-table.my-sticky-last-column-table(
            v-model:selected="selected"
            v-model:pagination="pagination"
            title="Mails"
            :rows="tickets.data"
            row-key="uid"
            @request="onRequest"
            :rows-per-page-options="[5, 10, 15]"
            :columns="columns"
            :loading="pending"
            rows-per-page-label="Lignes par page"
            no-data-label="Aucune donnée"
            loading-label="Chargement..."
            no-results-label="Aucun résultat"
            selection="multiple"
            :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} sur ${totalRowsNumber} lignes`"
            :selected-rows-label="(numberOfRows) => `${numberOfRows} tickets sélectionnées`"
            flat
          )
            template(#body-cell-actions="props")
              q-td(:props="props")
                q-btn-group(flat rounded)
                  q-btn(icon="mdi-eye" color="primary" @click="goToMail(props.row)" size="sm" flat)
                    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher le ticket
                  q-btn(icon="mdi-delete" color="primary" @click="" size="sm" flat)
                    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Supprimer le ticket
        q-separator(vertical)
        q-card-section.full-width(:style="{maxWidth: '50vw', overflow: 'hidden'}")
          q-card
            q-card-actions
              q-toolbar-title(v-text='target?.subject' style='flex: 100 1 0%')
              q-space
              q-btn(color="negative" icon='mdi-delete' @click="")
              q-btn(color="info" icon='mdi-email-arrow-right-outline' @click="")
              q-btn(color="primary" icon='mdi-content-save' @click="")
            q-card-section.q-pa-xs
              q-tabs(v-model="tab" dense)
                q-tab(name="mails" icon="mdi-mail" label="Mails")
                q-tab(name="raw" icon="mdi-square" label="raw")
              q-tab-panels(v-model="tab")
                q-tab-panel.no-padding(name="mails")
                  object(:data='"http://localhost:7100/tickets/mails/" + target?.uid + "/source"' style='width: 100%; height: 75vh;')
                q-tab-panel.no-padding(name="raw")
                  q-table(
                    :rows="target.headers"
                    :pagination='{rowsPerPage: 12}'
                    :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} sur ${totalRowsNumber} lignes`"
                    rows-per-page-label="Lignes par page"
                    no-data-label="Aucune donnée"
                    loading-label="Chargement..."
                    no-results-label="Aucun résultat"
                    flat
                  )
</template>

<script lang="ts" setup>
import { computed, onMounted, useDayjs } from '#imports'

const daysjs = useDayjs()
const $q = useQuasar()
import { useRoute, useRouter } from 'nuxt/app'
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { QTableProps } from 'quasar'
import type { components } from '#build/types/service-api'
type Ticket = components["schemas"]['TicketDto']

const route = useRoute()
const router = useRouter()

const selected: Ref<Ticket[]> = ref([])
const target: Ref<Ticket | null> = ref(null)
const tab = ref('')

const { data: tickets, pending, refresh, error } = await useHttpApi('/tickets/mails', {
  method: 'get',
  query: computed(() => {
    return {
      ...route.query,
    }
  })
})
const columns = ref<QTableProps['columns']>([
  {
    name: 'uid',
    label: 'ID',
    field: 'uid',
    align: 'left',
  },
  {
    name: 'envelope.subject',
    label: 'Sujet',
    field: (row: Ticket) => {
      const maxLength = ($q.screen.width / 2 / 10) - 30
      if (row.envelope.subject.length <= maxLength) {
        return row.envelope.subject
      }
      let truncated = row.envelope.subject.substring(0, maxLength)
      const re = new RegExp(/\s+\S*$/)
      const match = re.exec(truncated)
      truncated = truncated.substring(0, match?.index!)
      return `${truncated} ...`
    },
    align: 'left',
  },
  {
    name: 'envelope.date',
    label: 'Date de réception',
    field: (row: Ticket) => row.envelope.date,
    format: (val: string) => daysjs(val).format('DD/MM/YYYY HH:mm'),
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'left',
  },
])

const goToMail = async (ticket: Ticket) => {
  router.replace({
    query: {
      ...route.query,
      uid: ticket.uid,
    }
  })

  const { data: mail, pending, refresh, error } = await useHttpApi(`/tickets/mails/${ticket.uid}`, {
    method: 'get',
    query: computed(() => {
      return {
        ...route.query,
      }
    })
  })
  target.value = mail.value?.data
  tab.value = 'mails'
}

const pagination = ref<QTableProps['pagination']>({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
})

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
  query['skip'] = skip
  query['limit'] = limit
  router.replace({
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
</script>
<style lang="sass">
@import "quasar/src/css/variables.sass"
.my-sticky-last-column-table
  thead tr:last-child th:last-child
    background-color: $menu-background
  td:last-child
    background-color: $menu-background
  th:last-child,
  td:last-child
    position: sticky
    right: -1px
    z-index: 1
</style>

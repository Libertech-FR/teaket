<template lang="pug">
div
  q-card(flat)
    q-card-section(horizontal)
      q-card-section.full-width(:style="{maxWidth: '50vw', overflow: 'hidden'}")
        q-table.tk-sticky-last-column-table(
          selection="multiple"
          v-model:selected="selected"
          v-model:pagination="pagination"
          title="Mails"
          :rows="mails?.data"
          row-key="uid"
          @request="onRequest"
          :rows-per-page-options="[5, 10, 15]"
          :columns="columns"
          :loading="pending"
          rows-per-page-label="Lignes par page"
          no-data-label="Aucune donnée"
          loading-label="Chargement..."
          no-results-label="Aucun résultat"
          :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} sur ${totalRowsNumber} lignes`"
          :selected-rows-label="(numberOfRows) => `${numberOfRows} Mails sélectionnées`"
          flat
        )
          template(#body-cell-actions="props")
            q-td(:props="props")
              q-btn-group(flat rounded)
                q-btn(icon="mdi-eye" color="primary" @click="goToMail(props.row)" size="sm" flat)
                  q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher le ticket
                q-btn(icon="mdi-delete" color="primary" @click="deleteMail(props.row)" size="sm" flat)
                  q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Supprimer le ticket
      q-separator(vertical)
      q-card-section.full-width(:style="{maxWidth: '50vw', overflow: 'hidden'}")
        div.flex.items-center.full-height.justify-center(v-if='!target')
          p Selectionnez un email pour afficher son contenu...
        q-card(v-else)
          q-card-actions
            q-toolbar-title(v-text='target?.subject' style='flex: 100 1 0%')
            q-space
            q-btn(color="negative" icon='mdi-delete' @click="deleteMail(target)")
            q-btn(color="primary" icon='mdi-content-save' @click="importMail(target)")
          q-card-section.q-pa-xs
            q-tabs(v-model="tab" dense)
              q-tab(name="email" icon="mdi-mail" label="Email")
              q-tab(name="headers" icon="mdi-format-list-text" label="headers")
              q-tab(name="raw" icon="mdi-email-newsletter" label="Contenu")
            q-tab-panels(v-model="tab")
              q-tab-panel.no-padding(name="email")
                object.bg-white(:data='"http://localhost:7100/tickets/mails/" + target?.accountId + "/" + target?.seq + "/render?signature=" + target?.signature' style='width: 100%; height: 75vh;')
                  p Impossible de charger le contenu du mail
                  a(:href='"http://localhost:7100/tickets/mails/" + target?.accountId + "/" + target?.seq + "/render?signature=" + target?.signature' target='_blank') Lien direct
              q-tab-panel.no-padding(name="headers")
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
              q-tab-panel.no-padding(name="raw")
                object.bg-white(:data='"http://localhost:7100/tickets/mails/" + target?.accountId + "/" + target?.seq + "/source?signature=" + target?.signature' style='width: 100%; height: 75vh;')
                  p Impossible de charger le contenu du mail
                  a(:href='"http://localhost:7100/tickets/mails/" + target?.accountId + "/" + target?.seq + "/source?signature=" + target?.signature' target='_blank') Lien direct
</template>

<script lang="ts" setup>
import { computed, useDayjs } from '#imports'
import { useRoute, useRouter } from 'nuxt/app'
import { ref } from 'vue'
import type { QTableProps } from 'quasar'
// import type { components } from '#build/types/service-api'
import { omit } from 'radash'

type Mail = any
// type Mail = components["schemas"]['TicketDto']
const route = useRoute()
const $q = useQuasar()
const { pagination, onRequest, initializePagination } = usePagination()
const selected = ref<Mail[]>([])

const tab = ref('')
const target = ref<Mail | null>(null)
const {
  data: mails,
  refresh,
  pending,
  error,
} = await useHttpApi('/tickets/mails', {
  method: 'get',
  query: computed(() => {
    return {
      ...omit(route.query, ['accountId', 'seq']),
    }
  }),
})
if (mails.value) {
  initializePagination(mails.value?.total)
}

if (error.value) {
  console.error(error.value)
}
if (route.query.accountId && route.query.seq) {
  const { data } = await useHttpApi(`/tickets/mails/${route.query.accountId}/${route.query.seq}`, {
    method: 'get',
  })
  const mail = mails.value?.data.filter((mail: any) => mail.accountId === route.query.accountId && mail.seq === parseInt(`${route.query.seq}`, 10))[0]
  target.value = {
    ...data.value?.data,
    ...mail,
  }
  tab.value = 'email'
}
const daysjs = useDayjs()
const columns = ref<QTableProps['columns']>([
  {
    name: 'uid',
    label: 'ID',
    field: 'uid',
    align: 'left',
  },
  {
    name: 'accountName',
    label: 'Compte',
    field: 'accountName',
    align: 'left',
  },
  {
    name: 'envelope.subject',
    label: 'Sujet',
    field: (row: Mail) => {
      const $q = useQuasar()
      const maxLength = $q.screen.width / 2 / 10 - 30
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
    field: (row: Mail) => row.envelope.date,
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

const deleteMail = async (mail: Mail) => {
  $q.dialog({
    title: 'Suppression',
    message: 'Vous êtes sur le point de supprimer un email, êtes-vous sûr ?',
    cancel: true,
    persistent: true,
    color: 'negative',
  })
    .onOk(async () => {
      const { error } = await useHttpApi(`/tickets/mails/${mail.accountId}/${mail.seq}`, {
        method: 'delete',
      })
      if (error.value) {
        $q.notify({
          color: 'negative',
          message: `Impossible de supprimer l'email: ${mail.uid}`,
        })
        return
      }
      $q.notify({
        color: 'positive',
        message: 'Email supprimé avec succès',
      })
      target.value = null
      await refresh()
    })
    .onCancel(() => (target.value = null))
}
const importMail = async (mail: any) => {
  const { data, error } = await useHttpApi(`/tickets/mails/import`, {
    method: 'post',
    body: {
      account: mail.accountId,
      seq: mail.seq,
      uid: mail.uid,
      id: mail.id,
    },
  })
  if (error.value) {
    $q.notify({
      color: 'negative',
      message: `Impossible d\'importer l'email <${mail.uid}> ${error.value?.data?.message || error.value?.message}`,
    })
    return
  }
  $q.notify({
    color: 'positive',
    message: 'Email importé avec succès',
  })
  target.value = null
  await refresh()
}
const goToMail = async (mail: Mail) => {
  const router = useRouter()
  router.replace({
    query: {
      ...route.query,
      accountId: mail.accountId,
      seq: mail.seq,
    },
  })
  const { data } = await useHttpApi(`/tickets/mails/${mail.accountId}/${mail.seq}`, {
    method: 'get',
  })
  target.value = {
    ...mail,
    ...data.value?.data,
  }
  tab.value = 'email'
}
</script>

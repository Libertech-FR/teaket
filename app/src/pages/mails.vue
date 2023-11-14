<template lang="pug">
tk-2pan(
  :data="mails.data"
  :total="mails.total"
  :pending="pending"
  :refresh="refresh"
  :columns="columns"
  :crud="crud"
  :actions="actions"
  title="Mails"
)
  template(#top-left-btn-grp="{selected}")
    q-btn-group(rounded flat)
      tk-2pan-btns-add(:disabled="selected.length === 0" tooltip="Importer")
      tk-2pan-btns-remove(:disabled="selected.length === 0" tooltip="Rejeter")

  template(#right-panel-content="{target}")
    q-tabs(v-model="tab" dense)
      q-tab(name="email" icon="mdi-mail" label="Email")
      q-tab(name="headers" icon="mdi-format-list-text" label="Headers")
      q-tab(name="raw" icon="mdi-email-newsletter" label="Contenu")
      q-tab(name="raaw" icon="mdi-email-newsletter" label="Contenu")
    q-tab-panels.fit(v-model="tab")
      q-tab-panel.no-padding.overflow-hidden(name="email")
        object.bg-white.fit(
          :data='"http://host.docker.internal:7100/tickets/mails/" + target?.accountId + "/" + target?.seq + "/render?signature=" + target?.signature'
        )
          p Impossible de charger le contenu du mail
          a(:href='"http://host.docker.internal:7100/tickets/mails/" + target?.accountId + "/" + target?.seq + "/render?signature=" + target?.signature' target='_blank') Lien direct
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
          template(v-slot:body="props")
            q-tr(:props="props")
              q-td(key="key" :props="props" v-text='props.row.key')
              q-td(key="value" auto-width :props="props" v-text='props.row.value')
      q-tab-panel.no-padding.overflow-hidden(name="raw")
        object.bg-white.fit(
          :data='"http://host.docker.internal:7100/tickets/mails/" + target?.accountId + "/" + target?.seq + "/source?signature=" + target?.signature'
        )
          p Impossible de charger le contenu du mail
          a(:href='"http://host.docker.internal:7100/tickets/mails/" + target?.accountId + "/" + target?.seq + "/source?signature=" + target?.signature' target='_blank') Lien direct
      q-tab-panel.no-padding(name="raaw")
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
        q-input(label='username')
</template>

<script lang="ts" setup>
import { useHttpApi } from '../composables'
import { omit } from 'radash'
import type { QTableProps } from 'quasar'
type Mail = any
const route = useRoute()
const router = useRouter()
const dayjs = useDayjs()
const $q = useQuasar()
const {
  data: mails,
  refresh,
  pending,
  error,
} = await useHttpApi(
  '/tickets/mails',
  {
    method: 'get',
    query: computed(() => {
      return {
        ...omit(route.query, ['accountId', 'seq']),
      }
    }),
  },
  { redirect: true },
)

const crud = {
  create: false,
  read: true,
  update: true,
  delete: true,
}

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
    format: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm'),
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'left',
  },
  {
    name: 'envelope.date',
    label: 'Date de réception',
    field: (row: Mail) => row.envelope.date,
    format: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm'),
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'left',
  }
])
const tab = ref('email')
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
  tab.value = 'email'
  return {
    ...mail,
    ...data.value?.data,
  }
}

const deleteMail = async (mail: Mail) => {
  return new Promise((resolve) => {
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
          return resolve(mail)
        }
        $q.notify({
          color: 'positive',
          message: 'Email supprimé avec succès',
        })
        await refresh()
        return resolve(null)
      })
      .onCancel(() => {
        return resolve(mail)
      })
  })
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
    return mail
  }
  $q.notify({
    color: 'positive',
    message: 'Email importé avec succès',
  })
  return mail
}

const save = async (mail: Mail) => {
  return null
}

const actions = {
  create: importMail,
  read: goToMail,
  update: importMail,
  delete: deleteMail,

  cancel: async () => {
    await router.replace({
      query: omit(route.query, ['accountId', 'seq']),
    })
  },
  onMounted: async () => {
    if (route.query.accountId && route.query.seq) {
      return await goToMail(route.query)
    }
  },
}
</script>
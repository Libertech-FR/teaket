<template lang="pug">
tk-2pan(
  :data="identities.data"
  :total="identities.total"
  :pending="pending"
  :refresh="refresh"
  :columns="columns"
  :crud="crud"
  :actions="actions"
  title="Mails"
  title-key="displayName"
)
  template(#right-panel-content="{target}")
    .row
      .col-6.col-md-4.q-pa-xs
        q-input.q-my-xs(
          label='nom d\'utilisateur'
          v-model='target.username'
          filled
        )
      .col-6.col-md-4.q-pa-xs
        q-input.q-my-xs(
          label='nom d\'affichage'
          v-model='target.displayName'
          filled
        )
      .col-6.col-md-4.q-pa-xs
        tk-form-autocomplete(
          label='Entitée'
          v-model='target.entityId'
          filled
          v-bind='entityConfig'
        )
      .col-6.col-md-4.q-pa-xs
        q-input.q-my-xs(
          label='Email'
          v-model='target.email'
          filled
        )
      .col-6.col-md-4.q-pa-xs
        q-select.q-my-xs(
          label='Status'
          v-model='target.state.current'
          filled
        )
</template>

<script lang="ts" setup>
import { useHttpApi } from '~/composables'
import { omit } from 'radash'
import type { QTableProps } from 'quasar'
import type { components } from '#build/types/service-api'
type Identity = Partial<components['schemas']['IdentitiesDto']>
const route = useRoute()
const router = useRouter()
const dayjs = useDayjs()
const $q = useQuasar()
const entityConfig = {
  apiUrl: '/core/entities',
  searchField: 'profile.commonName',
  optionLabel: 'profile.commonName',
  optionValue: '_id',
  emitValue: true,
  multiple: false,
  modelLabel: 'profile.commonName',
}
const { data } = await useHttpApi('/core/identities', {
  method: 'get',
})
const {
  data: identities,
  refresh,
  pending,
  error,
} = await useHttpApi(
  '/core/identities',
  {
    method: 'get',
    query: computed(() => {
      return {
        ...omit(route.query, ['_id']),
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
    name: '_id',
    label: 'ID',
    field: '_id',
    align: 'left',
  },
  {
    name: 'displayName',
    label: "Nom d'affichage",
    field: 'displayName',
    align: 'left',
  },
  {
    name: 'username',
    label: 'Identifiant',
    field: 'username',
    align: 'left',
  },
  {
    name: 'state.current',
    label: 'Etat',
    field: (row: Identity) => row?.state?.current,
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'left',
  },
])

const actions = {
  create: async (identity: Identity) => {
    const { data, error } = await useHttpApi(`/core/identities`, {
      method: 'post',
      body: {
        ...identity,
      },
    })
    if (error.value) {
      $q.notify({
        color: 'negative',
        message: error.value?.data?.message || error.value?.message,
      })
      return identity
    }
    $q.notify({
      color: 'positive',
      message: 'Email importé avec succès',
    })
    await refresh()
    return null
  },

  read: async (identity: Identity) => {
    router.replace({
      query: {
        ...route.query,
        _id: identity?._id,
      },
    })
    const { data } = await useHttpApi(`/core/identities/{_id}`, {
      method: 'get',
      pathParams: {
        _id: identity._id,
      },
    })
    return data.value?.data
  },

  update: async (identity: Identity) => {
    const { data, error } = await useHttpApi(`/core/identities/{_id}`, {
      method: 'patch',
      pathParams: {
        _id: identity._id,
      },
      body: omit(identity, ['_id', 'metadata']),
    })
    if (error.value) {
      $q.notify({
        color: 'negative',
        message: error.value?.data?.message || error.value?.message,
      })
      return identity
    }
    $q.notify({
      color: 'positive',
      message: 'Compte modifié avec succès',
    })
    await refresh()
    return null
  },

  delete: async (identity: Identity) => {
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Suppression',
        message: 'Vous êtes sur le point de supprimer un compte, êtes-vous sûr ?',
        cancel: true,
        persistent: true,
        color: 'negative',
      })
        .onOk(async () => {
          const { error } = await useHttpApi(`/core/identities/{_id}`, {
            method: 'delete',
            pathParams: {
              _id: identity._id,
            },
          })
          if (error.value) {
            $q.notify({
              color: 'negative',
              message: `Impossible de supprimer le compte: ${identity._id}`,
            })
            return resolve(identity)
          }
          $q.notify({
            color: 'positive',
            message: 'Compte supprimé avec succès',
          })
          await refresh()
          return resolve(null)
        })
        .onCancel(() => {
          return resolve(identity)
        })
    })
  },

  cancel: async () => {
    await router.replace({
      query: omit(route.query, ['_id']),
    })
  },
  onMounted: async () => {
    if (route.query._id) {
      return await actions.read(route.query)
    }
  },
}
</script>

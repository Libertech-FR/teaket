<template lang="pug">
tk-2pan(
  ref='twopan'
  :data="entities.data"
  :total="entities.total"
  :pending="pending"
  :refresh="refresh"
  :visible-columns="visibleColumns"
  :columns="columns"
  :crud="crud"
  :actions="actions"
  title="Mails"
  title-key="profile.commonName"
)
  template(#body-cell-state.current="props")
    q-td(:props="props")
      q-badge(v-if='props.value.value === -1' color="blue-grey-8" :label="props.value.label")
      q-badge(v-else-if='props.value.value === 0' color="blue-grey-8" :label="props.value.label")
      q-badge(v-else color="positive" :label="props.value.label")
  template(#right-panel-title-before="{target}")
    q-chip(v-if='target.state.current === -1' color='blue-grey-8') Archivé
    q-chip(v-else-if='target.state.current === 0' color='blue-grey-8') Inactif
    q-chip(v-else color='green') Actif
  template(#right-panel-actions-content-before="{target}")
    q-btn(v-if='target.state.current === 0' icon='mdi-archive' color='blue-grey-8' @click='changeState(target, -1)')
      q-tooltip.text-body2 Archiver
    q-btn(v-if='target.state.current > 0' icon='mdi-block-helper' color='blue-grey-8' @click='changeState(target, 0)')
      q-tooltip.text-body2 Désactiver
    q-btn(v-if='target.state.current === 0' icon='mdi-arrow-up-drop-circle' color='positive' @click='changeState(target, 1)')
      q-tooltip.text-body2 Réactiver
    q-separator.q-mx-sm(v-if='target.state.current > -1' vertical)
  template(#right-panel-content="{target}")
    .row
      .col-6.q-pa-xs
        q-input.q-my-xs(
          label='Email'
          v-model='target.publicEmail'
          filled
        )
      .col-6.q-pa-xs
        q-input.q-my-xs(
          label='nom d\'affichage'
          v-model='target.profile.commonName'
          filled
        )
      .col-6.q-pa-xs
        q-select.q-my-xs(
          label='Type'
          v-model='target.type'
          :options='entityTypes'
          option-value='value'
          option-label='label'
          :emit-value='true'
          filled
        )
          template(#selected)
            span(v-if='target.type' v-text='entityTypes.filter((type) => type.value === target.type)[0].label')
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useHttpApi } from '~/composables'
import { omit } from 'radash'
import type { QTableProps } from 'quasar'
import type { components } from '#build/types/service-api'
import { Tk2pan } from '#components'
import { entityStates, entityTypes } from '~/utils/statics'

type Entity = Partial<components['schemas']['EntitiesDto']>

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
  modelLabel: 'publicEmail',
}
const { data } = await useHttpApi('/core/entities', {
  method: 'get',
})
const {
  data: entities,
  refresh,
  pending,
  error,
} = await useHttpApi(
  '/core/entities',
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
    name: 'profile.commonName',
    label: "Nom d'affichage",
    field: (row: Entity) => row?.profile?.commonName,
    align: 'left',
  },
  {
    name: 'type',
    label: 'Type',
    field: (row: Entity) => entityTypes.filter((type) => type.value === row?.type)[0]?.label,
    align: 'left',
  },
  {
    name: 'state.current',
    label: 'Etat',
    field: (row: Entity) => entityStates.find((type) => type.value === row?.state?.current),
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'left',
  },
])
const visibleColumns = ref<QTableProps['visibleColumns']>(['profile.commonName', 'type', 'state.current', 'actions'])

const twopan = ref<InstanceType<typeof Tk2pan>>(null)

async function changeState(target: Entity, to: number) {
  return new Promise((resolve, reject) => {
    $q.dialog({
      title: "Changement d'état",
      message: "Vous êtes sur le point de changer l'état du compte, voulez vous continuer ?",
      cancel: true,
      persistent: true,
      color: 'negative',
    })
      .onOk(async () => {
        const { data, error } = await useHttpApi(`/core/entities/{_id}`, {
          method: 'patch',
          pathParams: {
            _id: target._id,
          },
          body: {
            state: {
              current: to,
            },
          },
        })
        if (error.value) {
          $q.notify({
            color: 'negative',
            message: `Impossible de modifier l'état du compte: ${target._id}`,
          })
          return reject(target)
        }
        $q.notify({
          color: 'positive',
          message: 'Etat du compte modifié avec succès',
        })
        await refresh()
        twopan.value?.$.exposed.read(data.value?.data)
        return resolve(target)
      })
      .onCancel(() => {
        return resolve(target)
      })
  })
}

const actions = {
  create: async (identity: Entity) => {
    const { data, error } = await useHttpApi(`/core/entities`, {
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

  read: async (identity: Entity) => {
    router.replace({
      query: {
        ...route.query,
        _id: identity?._id,
      },
    })
    const { data } = await useHttpApi(`/core/entities/{_id}`, {
      method: 'get',
      pathParams: {
        _id: identity._id,
      },
    })
    return data.value?.data
  },

  update: async (entity: Entity) => {
    const { data, error } = await useHttpApi(`/core/entities/{_id}`, {
      method: 'patch',
      pathParams: {
        _id: entity._id,
      },
      body: omit(entity, ['_id', 'metadata']),
    })
    if (error.value) {
      $q.notify({
        color: 'negative',
        message: error.value?.data?.message || error.value?.message,
      })
      return entity
    }
    $q.notify({
      color: 'positive',
      message: 'Compte modifié avec succès',
    })
    await refresh()
    return null
  },

  delete: async (entity: Entity) => {
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Suppression',
        message: 'Vous êtes sur le point de supprimer un compte, êtes-vous sûr ?',
        cancel: true,
        persistent: true,
        color: 'negative',
      })
        .onOk(async () => {
          const { error } = await useHttpApi(`/core/entities/{_id}`, {
            method: 'delete',
            pathParams: {
              _id: entity._id,
            },
          })
          if (error.value) {
            $q.notify({
              color: 'negative',
              message: `Impossible de supprimer le compte: ${entity._id}`,
            })
            return resolve(entity)
          }
          $q.notify({
            color: 'positive',
            message: 'Compte supprimé avec succès',
          })
          await refresh()
          return resolve(null)
        })
        .onCancel(() => {
          return resolve(entity)
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

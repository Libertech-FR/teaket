<template lang="pug">
q-splitter(v-model="splitterModel" separator-style="width: 8px" background-color="primary" class="full-height"  :limits="[20,80]")
  template(#before)
    q-card.full-height.q-pa-sm(bordered)
      span {{ text }}
      q-table.tk-sticky-last-column-table.full-height(
        v-bind="$attrs"
        selection="multiple"
        v-model:selected="selected"
        v-model:pagination="pagination"
        :rows="data"
        row-key="uid"
        @request="onRequest($event, props.total)"
        :rows-per-page-options="[6, 12, 18]"
        :columns="columns"
        :loading="pending"
        rows-per-page-label="Lignes par page"
        no-data-label="Aucune donnée"
        loading-label="Chargement..."
        no-results-label="Aucun résultat"
        :pagination-label="(firstRowIndex, endRowIndex, totalRowsNumber) => `${firstRowIndex}-${endRowIndex} sur ${totalRowsNumber} lignes`"
        :selected-rows-label="(numberOfRows) => `${numberOfRows} entrée(s) sélectionnée(s)`"
        flat
      )
        template(v-slot:top-left)
          q-btn-group(rounded flat)
            slot(name="top-left-btn-grp" :selected="selected")
              slot(name="top-left-btn-grp-content-before")
              slot(name="top-left-btn-grp-content-after")
        template(v-slot:top-right)
          q-btn-group(rounded flat)
            slot(name="top-right-btn-grp")
              slot(name="top-right-btn-grp-content-before")
              tk-2pan-btns-add(@add="create" v-if="crud.create")
              tk-2pan-btns-refresh(@refresh="refresh")
              slot(name="top-right-btn-grp-content-after")
        template(v-slot:body-cell-actions="props")
          q-td(:props="props")
            q-btn-group(flat rounded)
              slot(name="body-cell-actions" :props="props")
                slot(name="body-cell-actions-content-before")
                tk-2pan-btns-read(@read="read(props.row)" v-if="crud.read")
                tk-2pan-btns-remove(@remove="remove(props.row)" v-if="crud.delete" )
                slot(name="body-cell-actions-content-after")

  template(#separator)
    q-avatar(size="sm" color="primary" icon="mdi-unfold-more-vertical" class="text-white")

  template(#after)
    q-card.full-height.q-pa-sm(bordered)
      q-card-section.q-pa-none.flex.items-center.full-height.justify-center(v-if='!target')
        slot(name="right-panel-empty")
          slot(name="right-panel-empty-content-before")
          p Selectionnez une entrée pour afficher son contenu...
          slot(name="right-panel-empty-content-after")
      q-card-section.q-pa-none(v-else)
        q-card-actions
          q-toolbar-title(v-text='target?.subject' style='flex: 100 1 0%')
          q-space
          slot(name="right-panel-actions")
            slot(name="right-panel-actions-content-before")
            q-btn(color="primary", icon="mdi-chevron-left" @click="target = null" tooltip="Retour")
              q-tooltip.text-body2 Retour
            q-btn(color="positive" icon='mdi-content-save-plus' @click="create(target)" v-if="crud.create")
              q-tooltip.text-body2 Enregistrer
            q-btn(color="positive" icon='mdi-content-save' @click="update(target)" v-if="crud.update")
              q-tooltip.text-body2 Enregistrer
            q-btn(color="negative" icon='mdi-delete' @click="remove(target)" v-if="crud.delete")
              q-tooltip.text-body2 Supprimer
            slot(name="right-panel-actions-content-after")
        q-card-section.q-pa-none
          slot(name="right-panel-content" :target="target")
            slot(name="right-panel-content-before")
            slot(name="right-panel-content-after")
</template>

<script lang="ts" setup>
import { computed, useDayjs } from '#imports'
import { useRoute, useRouter } from 'nuxt/app'
import { ref } from 'vue'
import type { QTableProps } from 'quasar'
import { useResizeObserver } from '@vueuse/core';
// import type { components } from '#build/types/service-api'
import type { PropType } from 'vue'

const splitterModel = ref(50)



const props = defineProps({
  data: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  columns: {
    type: Array as PropType<QTableProps['columns']>,
    default: () => [],
  },
  pending: {
    type: Boolean,
    default: false,
  },
  refresh: {
    type: Function,
    default: () => { },
  },
  total: {
    type: Number,
    default: 10,
  },
  defaultRightPanel: {
    type: Boolean,
    default: true,
  },
  crud: {
    type: Object as PropType<{
      create: boolean,
      read: boolean,
      update: boolean,
      delete: boolean,
    }>,
    default: () => ({
      create: false,
      read: true,
      update: false,
      delete: false,
    }),
  },
  actions: {
    type: Object as PropType<{
      create: Function,
      read: Function,
      update: Function,
      delete: Function,
    }>,
    default: {
      create: async (row) => { return row },
      read: async (row) => { return row },
      update: async (row) => { return row },
      delete: async (row) => { return row },
    },
  },
})

const route = useRoute()
const $q = useQuasar()
const { pagination, onRequest, initializePagination } = usePagination()
initializePagination(props.total)

const emit = defineEmits(['add', 'refresh', 'read'])

const selected = ref([])
const tab = ref('')
const target = ref(null)
const daysjs = useDayjs()

async function read(row) {
  const response = await props.actions.read(row)
  target.value = response
}

async function create(row) {
  const response = await props.actions.create(row)
  target.value = response
}

async function update(row) {
  const response = await props.actions.update(row)
  target.value = response
}

async function remove(row) {
  const response = await props.actions.delete(row)
  target.value = response
}
</script>

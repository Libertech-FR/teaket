<template lang="pug">
q-splitter(
  v-model="splitterModel"
  separator-style="width: 8px"
  background-color="primary"
  class="full-height"
  :limits="!$q.platform.is.mobile ? [20,80] : [0,100]"
  :horizontal='$q.platform.is.mobile'
  :style='{ "padding": $q.platform.is.mobile ? "6px 0" : "0" }'
)
  template(#before)
    q-card.full-height.q-pa-sm(bordered :class='{"desktop-only": target}')
      q-table.tk-sticky-last-column-table.full-height(
        v-bind="$attrs"
        selection="multiple"
        v-model:selected="selected"
        v-model:pagination="pagination"
        :rows="data"
        :visible-columns="visibleColumnsInternal"
        :row-key="rowKey"
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
        template(v-for="(_, name) in $slots" v-slot:[name]="slotData")
          slot(:name="name" v-bind="slotData")
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
              q-btn(flat icon="mdi-table-headers-eye" color="primary")
                q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher/cacher des colones
                q-menu(max-width="350px" max-height="350px").q-pa-md
                  .row
                    .col-6(v-for="column in columns" :key="column.value")
                      q-toggle(v-model='visibleColumnsComputed' :label="column.label" :val="column.name")
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
    q-avatar(v-if='!$q.platform.is.mobile' size="sm" color="primary" icon="mdi-unfold-more-vertical" class="text-white")

  template(#after)
    q-card.full-height.q-pa-sm(bordered :class='{"desktop-only": !target}')
      q-card-section.q-pa-none.flex.items-center.full-height.justify-center(v-if='!target')
        slot(name="right-panel-empty")
          slot(name="right-panel-empty-content-before")
          p Selectionnez une entrée pour afficher son contenu...
          slot(name="right-panel-empty-content-after")
      div.full-height.q-pa-none.flex.justify-start(v-else style='flex-flow: column; overflow-y: auto;')
        q-card-actions
          slot(name="right-panel-title" :target="target")
            slot(name="right-panel-title-before" :target="target")
            q-toolbar-title(v-text='getTitle' style='flex: 100 1 0%')
            slot(name="right-panel-title-after" :target="target")
          q-space
          slot(name="right-panel-actions")
            slot(name="right-panel-actions-content-before")
            q-btn(color="primary", icon="mdi-chevron-left" @click="cancel" tooltip="Retour")
              q-tooltip.text-body2 Retour
            q-separator.q-mx-sm(vertical)
            slot(name="right-panel-actions-content-before" :target="target")
            q-btn(color="positive" icon='mdi-content-save-plus' @click="create(target)" v-if="crud.create")
              q-tooltip.text-body2 Enregistrer
            q-btn(color="positive" icon='mdi-content-save' @click="update(target)" v-if="crud.update")
              q-tooltip.text-body2 Enregistrer
            q-btn(color="negative" icon='mdi-delete' @click="remove(target)" v-if="crud.delete")
              q-tooltip.text-body2 Supprimer
            slot(name="right-panel-actions-content-after")
        q-card-section.q-pa-none.fit.flex(style='flex-flow: column; overflow: hidden;')
          slot(name="right-panel-content" :target="target")
            slot(name="right-panel-content-before")
            slot(name="right-panel-content-after")
        q-expansion-item.bg-blue-grey-10(v-if='debug' label='Debug' icon='mdi-bug' dense)
          q-card.overflow-auto.bg-blue-grey-8(:style='{maxHeight: "250px", height: "250px"}')
            q-card-section.q-pa-xs
              pre.q-ma-none(v-html='JSON.stringify(target, null, 2)')
</template>

<script lang="ts" setup>
import { computed, useDayjs } from '#imports'
import { useRoute, useRouter } from 'nuxt/app'
import { ref, watch } from 'vue'
import type { QTableProps } from 'quasar'
import { useResizeObserver } from '@vueuse/core'
// import type { components } from '#build/types/service-api'
import type { PropType } from 'vue'
const $q = useQuasar()
const splitterModel = ref($q.screen.xs ? 100 : 50)

const props = defineProps({
  rowKey: {
    type: String,
    default: '_id',
  },
  visibleColumns: {
    type: Array as PropType<QTableProps['visibleColumns']>,
    default: () => [],
  },
  titleKey: {
    type: String,
    default: 'name',
  },
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
  rightPanelStyle: {
    type: Object as PropType<Partial<CSSStyleDeclaration>>,
    default: () => ({}),
  },
  crud: {
    type: Object as PropType<{
      create: boolean
      read: boolean
      update: boolean
      delete: boolean
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
      create: <T>(r: T) => Promise<T>
      read: <T>(r: T) => Promise<T>
      update: <T>(r: T) => Promise<T>
      delete: <T>(r: T) => Promise<T>

      cancel: () => Promise<void>
      onMounted: <T = object>() => Promise<T | null>
    }>,
    default: {
      create: async <T,>(row: T) => {
        return row
      },
      read: async <T,>(row: T) => {
        return row
      },
      update: async <T,>(row: T) => {
        return row
      },
      delete: async <T,>(row: T) => {
        return row
      },

      cancel: async () => { },
      onMounted: async () => { },
    },
  },
})

const visibleColumnsInternal = ref(props.visibleColumns)
const visibleColumnsComputed = computed({
  get() {
    return visibleColumnsInternal.value
  },
  set(value) {
    visibleColumnsInternal.value = value
  },
})

const route = useRoute()
const { pagination, onRequest, initializePagination } = usePagination()
initializePagination(props.total)

const emit = defineEmits(['add', 'refresh', 'read'])
const debug = process.env.NODE_ENV === 'development'

const selected = ref([])
const tab = ref('')
const target = ref<null | object>(null)
const target = ref<null | object>(null)
const daysjs = useDayjs()

watch(target, (t) => {
  if (t) selected.value = [t]
  if ($q.platform.is.mobile) {
    splitterModel.value = !t ? 100 : 0
  }
})

async function cancel() {
  await props.actions.cancel()
  target.value = null
  selected.value = []
}
watch(target, (t) => {
  if (t) selected.value = [t]
  if ($q.platform.is.mobile) {
    splitterModel.value = !t ? 100 : 0
  }
})

async function cancel() {
  await props.actions.cancel()
  target.value = null
  selected.value = []
}
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
  debugger
  debugger
  target.value = response
}

onMounted(async () => {
  const newTarget = await props.actions.onMounted()
  if (newTarget) {
    target.value = newTarget
  }
})

onMounted(async () => {
  const newTarget = await props.actions.onMounted()
  if (newTarget) {
    target.value = newTarget
  }
})
</script>

<template lang="pug">
q-card(style="height: 100%" flat).column.q-col-gutter-none
  q-toolbar.justify-end
    q-btn-group(dense)
      q-btn(v-if="!isDisabledTicket  && !isArchived" @click="showUpdateTicketDialog(LifeStep.CLOSED)" color="red" icon="mdi-lock" size="md" )
        q-tooltip.text-body2 Cloturer
      q-btn(v-if="isDisabledTicket && !isArchived"
        @click="showUpdateTicketDialog(LifeStep.OPEN)" color="green" icon="mdi-lock-open-variant" size="md"
      )
        q-tooltip.text-body2 Ouvrir
      q-btn(v-if="isDisabledTicket && !isArchived" @click="showUpdateTicketDialog(LifeStep.ARCHIVED)" color="grey" icon="mdi-archive" size="md" )
        q-tooltip.text-body2 Archiver
      q-btn(
        v-if="!isTicketAttribuedToCurrentUser && !isArchived"
        color="green" icon="mdi-clipboard-arrow-down-outline" @click="assignTicket" size="md" :disable="isDisabledTicket"
      )
        q-tooltip.text-body2 M'assigner le ticket
      q-btn(v-if="isTicketAttribuedToCurrentUser && !isArchived" color="red" icon="mdi-clipboard-arrow-up-outline" size="md" @click="unasignTicket" :disable="isDisabledTicket")
        q-tooltip.text-body2 Me désassigner le ticket

      //q-btn(color="primary" icon="mdi-printer" @click="console.log('Imprimer')" size="md")
        q-tooltip.text-body2 Imprimer
      q-btn(v-if='!isArchived' color="info" icon="mdi-content-save-all" @click="console.log('Save')" size="md" :disable="isDisabledTicket")
        q-tooltip.text-body2 Sauvegarder
      q-btn(color="red" icon="mdi-arrow-left" @click="router.go(-1)" size="md")
        q-tooltip.text-body2 Retour
  .col.q-col-gutter-none
    q-scroll-area(:style="{height: '100%'}")
      q-card
        q-card-section.text-right
          span.text-caption(v-if="countdown>0") Enregistrement des changements dans {{ countdown }}s
          span.text-caption(v-else) Données a jours
        q-card-section.scrollAreaSection
          q-expansion-item(label="Enveloppe" dense).bg-gray-4
            q-card
              q-card-section
                q-select.q-my-xs(
                  dense
                  @update:model-value="updateData({field: 'envelope.senders', value: $event})"
                  label="Appelant(s)" filled
                  :model-value="props.modelValue.envelope.senders"
                  option-label="name"
                  multiple
                  :readonly="true"
                )
                tk-form-autocomplete.q-my-xs(
                  apiUrl="/core/entities"
                  optionLabel="name"
                  modelLabel="name"
                  searchField="profile.commonName"
                  dense
                  @update:model-value="updateData({field: 'envelope.observers', value: $event})"
                  label="Concerné(s)" filled
                  :model-value="props.modelValue.envelope.observers"
                  multiple
                  :disable="isDisabledTicket"
                  :transformKeys="transform"
                )
                tk-form-autocomplete.q-my-xs(
                  apiUrl="/core/entities"
                  optionLabel="name"
                  modelLabel="name"
                  searchField="profile.commonName"
                  dense
                  @update:model-value="updateData({field: 'envelope.assigned', value: $event})"
                  label="Assigné(s)" filled
                  :model-value="props.modelValue.envelope.assigned"
                  multiple
                  :disable="isDisabledTicket"
                  :additionalFilters="assignedFilters"
                  :transformKeys="transform"
                )
          q-expansion-item(label="Informations" dense).bg-gray-4
            q-card
              q-card-section
                .row.items-center
                  .col-6 Type de ticket :
                  .col-6
                    q-chip(:icon="typeOfTicket.icon" :color="typeOfTicket.color" outline).q-mx-auto {{ typeOfTicket.label }}
                q-select.q-my-xs(
                  dense
                  label="Projet(s)" filled
                  @update:model-value="updateData({field: 'project', value: $event})"
                  :model-value="props.modelValue.project"
                  :options="getProjectsData"
                  option-label="name"
                  :disable="isDisabledTicket"
                )
                q-select.q-my-xs(
                  dense
                  label="Priorité" filled
                  @update:model-value="updateData({field: 'priority', value: $event})"
                  :model-value="props.modelValue.priority"
                  :options="priority"
                  option-label="name"
                  :disable="isDisabledTicket"
                )
                q-select.q-my-xs(
                  dense
                  label="Impact" filled
                  @update:model-value="updateData({field: 'impact', value: $event})"
                  :model-value="props.modelValue.impact"
                  :options="impact"
                  option-label="name"
                  :disable="isDisabledTicket"
                )
                q-select.q-my-xs(
                  dense
                  label="SLA" filled
                  @update:model-value="updateData({field: 'sla', value: $event})"
                  :model-value="props.modelValue.sla"
                  :options="getSlaData"
                  option-label="name"
                  :disable="isDisabledTicket"
                )
                q-input.q-my-xs(
                  dense label="Due date" type="date" filled v-model="dueDate"
                :disable="isDisabledTicket")
                q-input.q-my-xs(
                  dense label="Temps total" type="time" filled readonly v-model="totalTime")
          q-expansion-item(label="Cycle de vie" dense).bg-gray-4
            q-card
              q-card-section
                .row.justify-between.items-center
                  .col-3 Etat :
                  .col
                    q-chip(:icon="lifestepOfTicket?.icon" :color="lifestepOfTicket?.color" outline).q-mx-auto {{ lifestepOfTicket?.label }}
                  .col-3
                    q-space
                    q-btn(color="red" icon="mdi-close" size="md" flat @click="showCloseTicketDialog()" fab :disable="isDisabledTicket")
                      q-tooltip.text-body2 Cloturer
                .row.items-center
                  .col-3 Status :
                  .col
                    q-chip(:icon="stateOfTicket?.icon" :color="stateOfTicket?.color" outline).q-mx-auto {{ stateOfTicket?.name }}
  tk-tickets-close-dialog(v-model="closeTicketDialog" :selected="[props.modelValue]")
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject, watch } from 'vue'
import { ticketType, lifeSteps, useDayjs, usePinia, useQuasar } from '#imports'
import { useHttpApi } from '~/composables/useHttpApi'
import useCloseTicket from '~/composables/useCloseTicket'
import { useRouter } from 'vue-router'
import { impact, priority, LifeStep, EntityType } from '~/utils'
import type { PropType } from 'vue'
import type { components } from '#build/types/service-api'
import { pick } from 'radash'

type Ticket = components['schemas']['TicketDto']
type TicketUpdateDto = components['schemas']['TicketUpdateDto']
type IdnamePartDto = components['schemas']['IdnamePartDto']
type SlaPartDto = components['schemas']['SlaPartDto']
type EntityPartDto = components['schemas']['EntityPartDto']
type TicketType = components['schemas']['TicketDto']
type Entity = components['schemas']['EntitiesDto']
type State = components['schemas']['StatesDto']
type Project = components['schemas']['ProjectDto']
type Sla = components['schemas']['SlaDto']

const props = defineProps({
  modelValue: {
    type: Object as PropType<Ticket>,
    required: true,
  },
})
const emit = defineEmits(['fetch:ticketData', 'refresh:ticketData', 'update:modelValue'])
const dayjs = useDayjs()
const router = useRouter()
const store = usePinia()
const $q = useQuasar()
const ticketDataRef = ref(props.modelValue)
const closeTicketDialog = ref<boolean>(false)
const {
  data: states,
  pending: statesPending,
  refresh: statesRefresh,
  error: statesError,
} = await useHttpApi('/tickets/state', {
  method: 'get',
})
if (statesError.value) {
  $q.notify({
    message: 'Erreur lors de la recupération des états',
    color: 'negative',
  })
}

const {
  data: projects,
  pending: projectsPending,
  refresh: projectsRefresh,
  error: projectsError,
} = await useHttpApi('/core/project', {
  method: 'get',
})
if (projectsError.value) {
  $q.notify({
    message: 'Erreur lors de la recupération des projets',
    color: 'negative',
  })
}

const {
  data: sla,
  pending: slaPending,
  refresh: slaRefresh,
  error: slaError,
} = await useHttpApi('/tickets/sla', {
  method: 'get',
})
if (slaError.value) {
  $q.notify({
    message: 'Erreur lors de la recupération des sla',
    color: 'negative',
  })
}

const {
  data: entities,
  pending: entitiesPending,
  refresh: entitiesRefresh,
  error: entitiesError,
} = await useHttpApi('/core/entities', {
  method: 'get',
})
if (entitiesError.value) {
  $q.notify({
    message: 'Erreur lors de la recupération des entités',
    color: 'negative',
  })
}

const transform = {
  "_id": "id",
  "profile.commonName": "name",
  "type": "type"
}


const assignedFilters = [{ field: 'type', value: EntityType.AGENT, operator: "<=#" }]

const observers = computed(() => {
  return entities.value?.data.reduce((acc: { id: string; name: string; type: number }[], entity: Entity) => {
    if (entity.type <= EntityType.OTHER) {
      acc.push({
        id: entity._id,
        name: entity.profile.commonName,
        type: entity.type,
      })
    }
    return acc
  }, [])
})

const assigned = computed(() => {
  return entities.value?.data.reduce((acc: { id: string; name: string; type: number }[], entity: Entity) => {
    if (entity.type <= EntityType.AGENT) {
      acc.push({
        id: entity._id,
        name: entity.profile.commonName,
        type: entity.type,
      })
    }
    return acc
  }, [])
})

const typeOfTicket = computed(() => {
  return ticketType.find((type) => type.value === props.modelValue.type)
})

const lifestepOfTicket = computed(() => {
  return lifeSteps.find((step) => step.value === props.modelValue.lifestep)
})

const stateOfTicket = computed(() => {
  return states.value?.data.find((state: State) => state._id === `${props.modelValue.state?.id}`)
})

const getProjectsData = computed(() => {
  return projects.value?.data.map((project: Project) => {
    return {
      id: project._id,
      name: project.name,
    }
  })
})

const getSlaData = computed(() => {
  return sla.value?.data.map((sla: Sla) => {
    return {
      id: sla._id,
      name: sla.name,
    }
  })
})

const body = computed(() => {
  return pick(props.modelValue, changedFields.value)
})
const countdown = ref(0)
let timeoutId: NodeJS.Timeout
let intervalId: NodeJS.Timeout

const changedFields = ref<Array<string>>([])
const updateData = (ticket: { field: string; value: IdnamePartDto | SlaPartDto | EntityPartDto[] | LifeStep }) => {
  clearTimeout(timeoutId)
  clearInterval(intervalId)
  const data = { ...props.modelValue }
  switch (ticket.field) {
    case 'envelope.senders':
      data.envelope = {
        ...data.envelope,
        senders: ticket.value as EntityPartDto[],
      }
      break
    case 'envelope.observers':
      data.envelope = {
        ...data.envelope,
        observers: ticket.value as EntityPartDto[],
      }
      break
    case 'envelope.assigned':
      data.envelope = {
        ...data.envelope,
        assigned: ticket.value as EntityPartDto[],
      }
      break
    case 'project':
      data.project = ticket.value as IdnamePartDto
      break
    case 'priority':
      data.priority = ticket.value as IdnamePartDto
      break
    case 'impact':
      data.impact = ticket.value as IdnamePartDto
      break
    case 'sla':
      data.sla = { ...(ticket.value as SlaPartDto), manual: true } as SlaPartDto
      break
    case 'lifestep':
      data.lifestep = ticket.value as LifeStep
      break
    default:
      return
  }
  changedFields.value.push(ticket.field.startsWith('envelope') ? 'envelope' : ticket.field)
  emit('update:modelValue', data)
  saveCountdown()
}

function saveCountdown() {
  countdown.value = 3
  intervalId = setInterval(() => {
    countdown.value--
  }, 1000)
  timeoutId = setTimeout(async () => {
    await useHttpApi(`/tickets/ticket/{_id}`, {
      method: 'patch',
      pathParams: {
        _id: props.modelValue._id,
      },
      body: body.value,
    })
    emit('fetch:ticketData')
  }, 3000)
}

const ticketCountdown = computed(() => {
  const dueAt = dayjs(props.modelValue.sla.dueAt)
  const now = dayjs()
  const diff = dueAt.diff(now, 'second')
  countdown.value = diff
  return diff
})

const totalTime = computed(() => {
  const min = props.modelValue.totalTime % 60
  const hour = Math.floor(props.modelValue.totalTime / 60)
  const minString = min < 10 ? `0${min}` : `${min}`
  const hourString = hour < 10 ? `0${hour}` : `${hour}`
  return `${hourString}:${minString}`
})

const dueDate = computed(() => {
  return dayjs(props.modelValue.sla.dueAt).format('YYYY-MM-DD')
})

const assignTicket = async () => {
  const user = store.state.value.auth.user
  const { data, error } = await useHttpApi(`/tickets/ticket/{_id}`, {
    method: 'patch',
    pathParams: {
      _id: props.modelValue._id,
    },
    body: {
      envelope: {
        ...props.modelValue.envelope,
        assigned: [
          ...props.modelValue.envelope.assigned,
          {
            id: user._id,
            name: user.displayName,
            type: user.entity.type,
          },
        ],
      },
    },
  })
  if (error.value) {
    $q.notify({
      message: "Erreur lors de l'assignation du ticket",
      color: 'negative',
    })
  }
  emit('fetch:ticketData')
}

const unasignTicket = async () => {
  const user = store.state.value.auth.user
  const envelope = { ...props.modelValue.envelope }
  envelope.assigned = envelope.assigned.filter((user) => user.id !== store.state.value.auth.user._id)
  const { data, error } = await useHttpApi(`/tickets/ticket/{_id}`, {
    method: 'patch',
    pathParams: {
      _id: props.modelValue._id,
    },
    body: {
      envelope,
    },
  })
  if (error.value) {
    $q.notify({
      message: 'Erreur lors de la désassignation du ticket',
      color: 'negative',
    })
  }
  emit('fetch:ticketData')
}
const { openDialog } = useCloseTicket()
function refreshEvent() {
  emit('refresh:ticketData')
}
function showUpdateTicketDialog(lifestep: LifeStep) {
  openDialog({ ticket: props.modelValue, lifestep: lifestep, refreshEvent })
}

const isTicketAttribuedToCurrentUser = computed(() => {
  return props.modelValue.envelope.assigned.find((user) => user.id === store.state.value.auth.user._id)
})

const isDisabledTicket = inject<ref<boolean>>('isDisabledTicket')

const isArchived = computed(() => {
  return props.modelValue.lifestep === LifeStep.ARCHIVED
})
</script>

<style>
.scrollAreaSection.q-card__section.q-card__section--vert {
  padding: 0;
}
</style>

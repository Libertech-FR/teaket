<template lang="pug">
q-scroll-area(:style="{height: '100%'}")
    q-card
        q-toolbar.justify-end
            q-btn-group
                q-btn(@click="showCloseTicketDialog()" color="red" icon="mdi-close" size="md" :disable="isDisabledTicket")
                    q-tooltip.text-body2 Cloturer
                q-btn(
                    v-if="!props.ticketData.envelope.assigned.find((user) => user.id === store.state.value.auth.user._id)"
                    color="green" icon="mdi-clipboard-arrow-down-outline" @click="assignTicket" size="md" :disable="isDisabledTicket"
                ) 
                    q-tooltip.text-body2 M'assigner le ticket
                q-btn(v-else color="red" icon="mdi-clipboard-arrow-up-outline" size="md" @click="unasignTicket" :disable="isDisabledTicket") 
                    q-tooltip.text-body2 Me désassigner le ticket

                q-btn(color="primary" icon="mdi-printer" @click="console.log('Imprimer')" size="md")
                    q-tooltip.text-body2 Imprimer
                q-btn(color="info" icon="mdi-content-save-all" @click="console.log('Save')" size="md" :disable="isDisabledTicket")
                    q-tooltip.text-body2 Sauvegarder
                q-btn(color="red" icon="mdi-arrow-left" @click="router.go(-1)" size="md")
                    q-tooltip.text-body2 Retour
        q-card-section.text-right
            span.text-caption(v-if="countdown>0") Enregistrement des changements dans {{ countdown }}s
            span.text-caption(v-else) Données a jours
        q-card-section
            q-expansion-item(label="Enveloppe").bg-gray-4
                q-card
                    q-card-section
                        q-select.q-my-xs(
                            @update:model-value="updateData({field: 'envelope.senders', value: $event})"
                            label="Appelant(s)" filled 
                            v-model="ticketDataRef.envelope.senders"
                            option-label="name"
                            use-input use-chips multiple
                            :readonly="true"
                        )
                        q-select.q-my-xs(
                            option-label="name"
                            @update:model-value="updateData({field: 'envelope.observers', value: $event})"
                            label="Concerné(s)" filled 
                            v-model="ticketDataRef.envelope.observers"
                            use-input use-chips multiple
                            :disable="isDisabledTicket"
                            :options="observers"
                        )
                        q-select.q-my-xs(
                            option-label="name"
                            @update:model-value="updateData({field: 'envelope.assigned', value: $event})"
                            label="Assigné(s)" filled 
                            v-model="ticketDataRef.envelope.assigned"
                            use-input use-chips multiple
                            :disable="isDisabledTicket"
                            :options="assigned"
                        )
            q-expansion-item(label="Informations").bg-gray-4
                q-card
                    q-card-section
                        .row.items-center 
                            .col-6 Type de ticket : 
                            .col-6
                                q-chip(:icon="typeOfTicket.icon" :color="typeOfTicket.color" outline).q-mx-auto {{ typeOfTicket.label }}
                        q-select.q-my-xs(
                            label="Projet(s)" filled 
                            @update:model-value="updateData({field: 'project', value: $event})"
                            v-model="ticketDataRef.project"
                            :options="getProjectsData" 
                            option-label="name"
                            :disable="isDisabledTicket"
                        )
                        q-select.q-my-xs(
                            label="Priorité" filled
                            @update:model-value="updateData({field: 'priority', value: $event})"
                            v-model="ticketDataRef.priority"
                            :options="priority" 
                            option-label="name"
                            :disable="isDisabledTicket"
                        )
                        q-select.q-my-xs(
                            label="Impact" filled
                            @update:model-value="updateData({field: 'impact', value: $event})"
                            v-model="ticketDataRef.impact"
                            :options="impact" 
                            option-label="name"
                            :disable="isDisabledTicket"
                        )
                        q-select.q-my-xs(
                            label="SLA" filled
                            @update:model-value="updateData({field: 'sla', value: $event})"
                            v-model="ticketDataRef.sla"
                            :options="getSlaData" 
                            option-label="name"
                            :disable="isDisabledTicket"
                        )
                        q-input.q-my-xs( label="Due date" type="date" filled v-model="dueDate"
                        :disable="isDisabledTicket")
                        q-input.q-my-xs( label="Temps total" type="time" filled readonly v-model="totalTime")
            q-expansion-item(label="Cycle de vie").bg-gray-4
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
        q-dialog(v-model="closeTicketDialog")
            q-card.q-pa-sm
                q-card-section.row.items-center
                    .col-12.text-h6.text-center
                        | Voulez vous vraiment cloturer le ticket ?
                q-card-actions
                    q-btn(color="red" label="Annuler" flat @click="closeDialog = false")
                    q-btn(color="green" label="Confirmer" flat @click="closeTicket")
                    //- q-btn(color="primary" label="Réouvrir" flat @click="openTicket")
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject, watch } from 'vue'
import { ticketType, lifeSteps, useDayjs, usePinia, useQuasar } from '#imports';
import { useHttpApi } from '~/composables/useHttpApi';
import { useRouter } from 'vue-router';
import { impact, priority, LifeStep, EntityType } from '~/utils';
import type { components } from '#build/types/service-api'
type TicketUpdateDto = components['schemas']['TicketUpdateDto']
type IdnamePartDto = components["schemas"]["IdnamePartDto"]
type SlaPartDto = components["schemas"]["SlaPartDto"]
type EntityPartDto = components["schemas"]["EntityPartDto"]
type TicketType = components['schemas']['TicketDto']
type Entity = components['schemas']['EntityDto']
type State = components['schemas']['StateDto']
type Project = components['schemas']['ProjectDto']
type Sla = components['schemas']['SlaDto']
const props = defineProps({
    ticketData: {
        type: Object,
        required: true
    }
})
const emit = defineEmits(['fetch:ticketData', 'update:ticketData'])
const dayjs = useDayjs()
const router = useRouter()
const store = usePinia()
const $q = useQuasar()
const ticketDataRef = ref(props.ticketData)
const closeTicketDialog = ref<boolean>(false)
const { data: states, pending: statesPending, refresh: statesRefresh, error: statesError } = await useHttpApi('/tickets/state', {
    method: 'get'
})
if (statesError.value) {
    $q.notify({
        message: 'Erreur lors de la recupération des états',
        color: 'negative'
    })
}

const { data: projects, pending: projectsPending, refresh: projectsRefresh, error: projectsError } = await useHttpApi('/core/project', {
    method: 'get'
})
if (projectsError.value) {
    $q.notify({
        message: 'Erreur lors de la recupération des projets',
        color: 'negative'
    })
}

const { data: sla, pending: slaPending, refresh: slaRefresh, error: slaError } = await useHttpApi('/tickets/sla', {
    method: 'get'
})
if (slaError.value) {
    $q.notify({
        message: 'Erreur lors de la recupération des sla',
        color: 'negative'
    })
}

const { data: entities, pending: entitiesPending, refresh: entitiesRefresh, error: entitiesError } = await useHttpApi('/core/entities', {
    method: 'get'
})
if (entitiesError.value) {
    $q.notify({
        message: 'Erreur lors de la recupération des entités',
        color: 'negative'
    })
}

const observers = computed(() => {
    return entities.value?.data.reduce((acc: { id: string, name: string, type: number }[], entity: Entity) => {
        if (entity.type <= EntityType.OTHER) {
            acc.push({
                id: entity._id,
                name: entity.profile.commonName,
                type: entity.type
            })
        }
        return acc
    }, [])
})

const assigned = computed(() => {
    return entities.value?.data.reduce((acc: { id: string, name: string, type: number }[], entity: Entity) => {
        if (entity.type <= EntityType.AGENT) {
            acc.push({
                id: entity._id,
                name: entity.profile.commonName,
                type: entity.type
            })
        }
        return acc
    }, [])
})

const typeOfTicket = computed(() => {
    return ticketType.find((type) => type.value === props.ticketData.type)
})

const lifestepOfTicket = computed(() => {
    return lifeSteps.find((step) => step.value === props.ticketData.lifestep)
})

const stateOfTicket = computed(() => {
    return states.value?.data.find((state: State) => state._id === props.ticketData.state?.id)
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

const body = ref<TicketUpdateDto>({})
const countdown = ref(0)

let timeoutId: NodeJS.Timeout
let intervalId: NodeJS.Timeout

const updateData = (ticket: { field: string, value: IdnamePartDto | SlaPartDto | EntityPartDto[] | LifeStep }) => {
    clearTimeout(timeoutId)
    clearInterval(intervalId)
    if (ticket.field === 'envelope.senders') {
        body.value.envelope = {
            ...props.ticketData.envelope,
            senders: ticket.value as EntityPartDto[]
        }
    }
    if (ticket.field === 'envelope.observers') {
        body.value.envelope = {
            ...props.ticketData.envelope,
            observers: ticket.value as EntityPartDto[]
        }
    }
    if (ticket.field === 'envelope.assigned') {
        body.value.envelope = {
            ...props.ticketData.envelope,
            assigned: ticket.value as EntityPartDto[]
        }
    }
    if (ticket.field === 'project') body.value.project = ticket.value as IdnamePartDto
    if (ticket.field === 'priority') body.value.priority = ticket.value as IdnamePartDto
    if (ticket.field === 'impact') body.value.impact = ticket.value as IdnamePartDto
    if (ticket.field === 'sla') body.value.sla = { ...ticket.value, manual: true } as SlaPartDto
    if (ticket.field === 'lifestep') body.value.lifestep = ticket.value as LifeStep

    countdown.value = 3
    intervalId = setInterval(() => {
        countdown.value--
    }, 1000)
    timeoutId = setTimeout(() => {
        useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
            method: 'patch',
            body: body.value
        })
        body.value = {}
        emit('fetch:ticketData')
    }, 3000)
}

const ticketCountdown = computed(() => {
    const dueAt = dayjs(props.ticketData.sla.dueAt)
    const now = dayjs()
    const diff = dueAt.diff(now, 'second')
    countdown.value = diff
    return diff
})

const totalTime = computed(() => {
    const min = props.ticketData.totalTime % 60
    const hour = Math.floor(props.ticketData.totalTime / 60)
    const minString = min < 10 ? `0${min}` : `${min}`
    const hourString = hour < 10 ? `0${hour}` : `${hour}`
    return `${hourString}:${minString}`
})

const dueDate = computed(() => {
    return dayjs(props.ticketData.sla.dueAt).format('YYYY-MM-DD')
})

const showCloseTicketDialog = () => {
    closeTicketDialog.value = true
}

const closeTicket = async () => {
    const { data, error } = await useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
        method: 'patch',
        body: {
            lifestep: LifeStep.CLOSED,
        }
    })
    if (error.value) {
        $q.notify({
            message: 'Erreur lors de la cloture du ticket',
            color: 'negative'
        })
    }

    emit('fetch:ticketData')
    closeTicketDialog.value = false
}

const openTicket = async () => {
    const { data, error } = await useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
        method: 'patch',
        body: {
            lifestep: LifeStep.OPEN,
        }
    })

    if (error.value) {
        $q.notify({
            message: 'Erreur lors de la réouverture du ticket',
            color: 'negative'
        })
    }
    emit('fetch:ticketData')
    closeTicketDialog.value = false
}

const assignTicket = async () => {
    const user = store.state.value.auth.user
    const { data, error } = await useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
        method: 'patch',
        body: {
            envelope: {
                ...props.ticketData.envelope,
                assigned: [
                    ...props.ticketData.envelope.assigned,
                    {
                        id: user._id,
                        name: user.displayName,
                        type: user.entity.type
                    }
                ]
            }
        }
    })
    if (error.value) {
        $q.notify({
            message: 'Erreur lors de l\'assignation du ticket',
            color: 'negative'
        })
    }
    emit('fetch:ticketData')
}

const unasignTicket = async () => {
    const user = store.state.value.auth.user
    const { data, error } = await useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
        method: 'patch',
        body: {
            envelope: {
                ...props.ticketData.envelope,
                assigned: props.ticketData.envelope.assigned.filter((user: { id: string, name: string, type: number }) => user.id !== store.state.value.auth.user._id)
            }
        }
    })
    if (error.value) {
        $q.notify({
            message: 'Erreur lors de la désassignation du ticket',
            color: 'negative'
        })
    }
    emit('fetch:ticketData')
}

const isDisabledTicket = inject('isDisabledTicket')

</script>

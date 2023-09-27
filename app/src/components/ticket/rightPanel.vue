<template lang="pug">
q-scroll-area(:style="{height: '100%'}")
    q-card
        q-toolbar.justify-end
            q-btn-group
                q-btn(@click="showCloseTicketDialog()" color="red" icon="mdi-close" size="md" :disable="disabled")
                    q-tooltip.text-body2 Cloturer
                q-btn(
                    v-if="!props.ticketData.envelope.assigned.find((user: any) => user.id === store.state.value.auth.user._id)"
                    color="green" icon="mdi-clipboard-arrow-down-outline" @click="assignTicket" size="md" :disable="disabled"
                ) 
                    q-tooltip.text-body2 M'assigner le ticket
                q-btn(v-else color="red" icon="mdi-clipboard-arrow-up-outline" size="md" @click="unasignTicket" :disable="disabled") 
                    q-tooltip.text-body2 Me désassigner le ticket

                q-btn(color="primary" icon="mdi-printer" @click="console.log('Imprimer')" size="md")
                    q-tooltip.text-body2 Imprimer
                q-btn(color="info" icon="mdi-content-save-all" @click="console.log('Save')" size="md" :disable="disabled")
                    q-tooltip.text-body2 Sauvegarder
                q-btn(color="red" icon="mdi-arrow-left" @click="console.log(router.go(-1))" size="md")
                    q-tooltip.text-body2 Retour
        q-card-section.text-right
            span.text-caption(v-if="countdown>0") Enregistrement des changements dans {{ countdown }}s
            span.text-caption(v-else) Données a jours
        q-card-section
            q-expansion-item(label="Enveloppe").bg-gray-4
                q-card
                    q-card-section
                        q-select.q-my-xs(
                            label="Appelant(s)" filled v-model="props.ticketData.envelope.senders"
                            option-label="name"
                            use-input use-chips multiple
                            new-value-mode="add-unique"
                            :disable="disabled"
                        )
                        q-select.q-my-xs(
                            option-label="name"
                            label="Concerné(s)" filled v-model="props.ticketData.envelope.observers"
                            use-input use-chips multiple
                            new-value-mode="add-unique"
                            :disable="disabled"
                        )
                        q-select.q-my-xs(
                            option-label="name"
                            label="Assigné(s)" filled v-model="props.ticketData.envelope.assigned"
                            use-input use-chips multiple
                            new-value-mode="add-unique"
                            :disable="disabled"
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
                            v-model="props.ticketData.project"
                            :options="getProjectsData" 
                            option-label="name"
                            :disable="disabled"
                        )
                        q-select.q-my-xs(
                            label="Priorité" filled
                            v-model="props.ticketData.priority"
                            :options="priority" 
                            option-label="name"
                            :disable="disabled"
                        )
                        q-select.q-my-xs(
                            label="Impact" filled
                            v-model="props.ticketData.impact"
                            :options="impact" 
                            option-label="name"
                            :disable="disabled"
                        )
                        q-select.q-my-xs(
                            label="SLA" filled
                            v-model="props.ticketData.sla"
                            :options="sla.data" 
                            option-label="name"
                            :disable="disabled"
                        )
                        q-input.q-my-xs( label="Due date" type="date" filled v-model="dueDate"
                        :disable="disabled")
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
                                q-btn(color="red" icon="mdi-close" size="md" flat @click="showCloseTicketDialog()" fab)
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
                    q-btn(color="primary" label="Réouvrir" flat @click="openTicket")
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject, watch } from 'vue'
import { ticketType, lifeSteps, useDayjs, usePinia } from '#imports';
import { useHttpApi } from '~/composables/useHttpApi';
import { useRouter } from 'vue-router';
import { impact, priority, LifeStep } from '~/utils';
import type { components } from '#build/types/service-api'

type TicketType = components['schemas']['Ticket']
const props = defineProps({
    ticketData: {
        type: Object,
        required: true
    } as TicketType,
    disabled: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['update:ticketData'])
const dayjs = useDayjs()
const router = useRouter()
const store = usePinia()

const ticket = ref(props.ticketData)
const closeTicketDialog = ref<boolean>(false)
const { data: states, pending: statesPending, refresh: statesRefresh, error: statesError } = await useHttpApi('/tickets/state', {
    method: 'get'
})

const { data: projects, pending: projectsPending, refresh: projectsRefresh, error: projectsError } = await useHttpApi('/core/project', {
    method: 'get'
})

const { data: sla, pending: slaPending, refresh: slaRefresh, error: slaError } = await useHttpApi('/tickets/sla', {
    method: 'get'
})

const typeOfTicket = computed(() => {
    return ticketType.find((type: any) => type.value === props.ticketData.type)
})

const lifestepOfTicket = computed(() => {
    return lifeSteps.find((step: any) => step.value === props.ticketData.lifestep)
})

const stateOfTicket = computed(() => {
    return states.value?.data.find((state: any) => state._id === props.ticketData.state.id)
})

const getProjectsData = computed(() => {
    return projects.value?.data.map((project: any) => {
        return {
            id: project._id,
            name: project.name,
        }
    })
})

const getSlaData = computed(() => {
    return sla.value?.data.map((sla: any) => {
        return {
            id: sla._id,
            name: sla.name,
        }
    })
})

const countdown = ref(0)
let interval: NodeJS.Timeout

watch(ticket, (newTicket, oldTicket) => {
    countdown.value = 3
    clearInterval(interval)
    interval = setInterval(() => {
        countdown.value--
        if (countdown.value === 0) {
            clearInterval(interval)
            useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
                method: 'patch',
                body: {
                    envelope: {
                        ...newTicket.envelope,
                    },
                    project: { ...newTicket.project },
                    priority: { ...newTicket.priority },
                    impact: { ...newTicket.impact },
                    state: { ...newTicket.state },
                    // sla: { ...newTicket.sla}
                    lifestep: newTicket.lifestep,
                }
            })
        }
    }, 1000)
}, { deep: true })

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
    const data = await useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
        method: 'patch',
        body: {
            lifestep: LifeStep.CLOSED,
        }
    })
    emit('update:ticketData')
    closeTicketDialog.value = false
}

const openTicket = async () => {
    const data = await useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
        method: 'patch',
        body: {
            lifestep: LifeStep.OPEN,
        }
    })
    emit('update:ticketData')
    closeTicketDialog.value = false
}

const assignTicket = async () => {
    const user = store.state.value.auth.user
    const data = await useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
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
    emit('update:ticketData')
}

const unasignTicket = async () => {
    const user = store.state.value.auth.user
    const data = await useHttpApi(`/tickets/ticket/${props.ticketData._id}`, {
        method: 'patch',
        body: {
            envelope: {
                ...props.ticketData.envelope,
                assigned: props.ticketData.envelope.assigned.filter((user: any) => user.id !== store.state.value.auth.user._id)
            }
        }
    })
    emit('update:ticketData')
}

</script>

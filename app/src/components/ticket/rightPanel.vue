<template lang="pug">
q-scroll-area(:style="{height: '100%'}")
    q-card
        q-toolbar.justify-end
            q-btn-group
                q-btn(color="green" icon="mdi-clipboard-arrow-down" @click="console.log('Imprimer')" size="md") M'assigner le ticket
                    q-tooltip.text-body2 M'assigner le ticket
                q-btn(color="primary" icon="mdi-printer" @click="console.log('Imprimer')" size="md")
                    q-tooltip.text-body2 Imprimer
                q-btn(color="info" icon="mdi-content-save-all" @click="console.log('Save')" size="md")
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
                            label="Appelant(s)" filled v-model="ticket.envelope.senders"
                            option-label="name"
                            use-input use-chips multiple
                            new-value-mode="add-unique"
                        )
                        q-select.q-my-xs(
                            option-label="name"
                            label="Concerné(s)" filled v-model="ticket.envelope.observers"
                            use-input use-chips multiple
                            new-value-mode="add-unique"
                        )
                        q-select.q-my-xs(
                            option-label="name"
                            label="Assigné(s)" filled v-model="ticket.envelope.assigned"
                            use-input use-chips multiple
                            new-value-mode="add-unique"
                        )
            q-expansion-item(label="Informations").bg-gray-4
                q-card
                    q-card-section
                        .row.items-center 
                            .col-6 Type de ticket : 
                            .col-6
                                q-chip(:icon="typeOfTicket.icon" :color="typeOfTicket.color" outline).q-mx-auto {{ typeOfTicket.label }}
                        q-select.q-my-xs(
                            label="Projet(s)" filled v-model="ticket.project"
                            use-input use-chips
                            new-value-mode="add-unique"
                            :options="projects.data" 
                            option-label="name"
                        )
                        q-select.q-my-xs(
                            label="Priorité" filled
                            use-input use-chips
                            v-model="ticket.priority"
                            :options="priority" 
                            option-label="name"
                        )
                        q-select.q-my-xs(
                            label="Impact" filled
                            use-input use-chips
                            new-value-mode="add-unique"
                            v-model="ticket.impact"
                            :options="impact" 
                            option-label="name"
                        )
                        q-select.q-my-xs(
                            label="SLA" filled
                            use-input use-chips
                            new-value-mode="add-unique"
                            v-model="ticket.sla"
                            :options="sla.data" 
                            option-label="name"
                        )
                        q-input.q-my-xs( label="Due date" type="date" filled v-model="dueDate")
                        q-input.q-my-xs( label="Temps total" type="time" filled readonly v-model="totalTime")
            q-expansion-item(label="Cycle de vie").bg-gray-4
                q-card
                    q-card-section
                        .row.items-center 
                            .col-6 Etape de vie : 
                            .col-6
                                q-chip(:icon="lifestepOfTicket?.icon" :color="lifestepOfTicket?.color" outline).q-mx-auto {{ lifestepOfTicket?.label }}
                        .row.items-center 
                            .col-6 State : 
                            .col-6
                                q-chip(:icon="stateOfTicket?.icon" :color="stateOfTicket?.color" outline).q-mx-auto {{ stateOfTicket?.name }}
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject, watch } from 'vue'
import { ticketType, lifeSteps, useDayjs } from '#imports';
import { useHttpApi } from '~/composables/useHttpApi';
import { useRouter } from 'vue-router';
import { impact, priority } from '~/utils';
import { omit } from 'radash'

const props = defineProps({
    ticketData: {
        type: Object,
        required: true
    }
})
const dayjs = useDayjs()
const router = useRouter()
const ticket = ref(props.ticketData)
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
    return ticketType.find((type: any) => type.value === ticket.value.type)
})

const lifestepOfTicket = computed(() => {
    return lifeSteps.find((step: any) => step.value === ticket.value.lifestep)
})

const stateOfTicket = computed(() => {
    return states.value?.data.find((state: any) => state._id === ticket.value.state.id)
})

const countdown = ref(0)
let interval: NodeJS.Timeout

watch(ticket, (newTicket, oldTicket) => {
    startCountdown()
    console.log('ticket changed')
    console.log(newTicket)
    console.log(oldTicket)
}, { deep: true })

watch(countdown, (newCountdown) => {
    if (newCountdown === 0) {
        resetCountdown()
        const body = omit(ticket.value, ['_id', 'metadata', 'tags', 'sequence', 'subject'])
        useHttpApi(`/tickets/ticket/${ticket.value._id}`, {
            method: 'patch',
            body
        })
    }
})

const startCountdown = () => {
    resetCountdown()
    interval = setInterval(() => {
        countdown.value--
        console.log(countdown.value)
    }, 1000)
}

const resetCountdown = () => {
    countdown.value = 15
    clearInterval(interval)
}

const ticketCountdown = computed(() => {
    const dueAt = dayjs(ticket.value.sla.dueAt)
    const now = dayjs()
    const diff = dueAt.diff(now, 'second')
    countdown.value = diff
    return diff
})

const totalTime = computed(() => {
    const min = ticket.value.totalTime % 60
    const hour = Math.floor(ticket.value.totalTime / 60)
    const minString = min < 10 ? `0${min}` : `${min}`
    const hourString = hour < 10 ? `0${hour}` : `${hour}`
    return `${hourString}:${minString}`
})

const dueDate = computed(() => {
    return dayjs(ticket.value.sla.dueAt).format('YYYY-MM-DD')
})

onMounted(() => {
    // ticket.value.senders = props.ticketData.envelope.senders.map((sender: any) => sender.name)
    // ticket.value.observers = props.ticketData.envelope.observers.map((observer: any) => observer.name)
    // ticket.value.assigned = props.ticketData.envelope.assigned.map((assignee: any) => assignee.name)
})

</script>

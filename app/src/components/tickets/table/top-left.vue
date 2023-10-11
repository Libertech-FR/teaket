<template lang="pug">
q-btn-group(rounded flat)
    q-btn(icon="mdi-eye-check-outline" color="primary" rounded @click="markAsRead" size="md" :disable="selected.length === 0" primary)
        q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Marqué comme lu
    q-btn(flat icon="mdi-merge" color="primary" rounded @click="mergeTickets" size="md" :disable="true ||selected.length === 0 || selected.length === 1")
        q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Fusionner les tickets sélectionnés
    q-btn(flat icon="mdi-eye" color="primary" rounded @click="goToTicket(selected[0])" size="md" :disable="selected.length === 0 || selected.length !== 1")
        q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher les tickets sélectionnés
    q-btn(flat icon="mdi-delete" color="primary" rounded @click="openDialog" size="md" :disable="selected.length === 0")
        q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Cloturer les tickets sélectionnés
    q-btn(flat icon="mdi-close" color="primary" rounded @click="clearSelection" size="md")
        q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Nettoyer la selection
</template>

<script lang="ts" setup>
import type { components } from '#build/types/service-api'
import type { PropType } from 'vue'
import { useRouter } from "nuxt/app";
type Ticket = components['schemas']['TicketDto']

const props = defineProps({
    selected: {
        type: Array as PropType<Ticket[]>,
        default: () => []
    }
})

const emit = defineEmits(['openDialog', 'clear'])

function openDialog() {
    emit('openDialog')
}

function clearSelection() {
    emit('clear')
}

function markAsRead() {
    console.log('markAsRead')
}

function mergeTickets() {
    console.log('mergeTickets')
}

function goToTicket(ticket: Ticket) {
    useRouter().push(`/ticket/${ticket._id}`)
}

</script>
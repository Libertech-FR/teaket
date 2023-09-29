<template lang="pug">
q-page.row.items-stretch
    .col-12
        .row(style="height: 100%")
            //- .col-12.col-md-2.q-pa-sm
            //-     tk-ticketLeftPanel(:sequence="ticketData.data.sequence")
            .col-12.col-md-9.q-pa-sm
                tk-ticketMainPanel(:sequence="ticketData.data.sequence" :subject="ticketData.data.subject")
            .col-12.col-md-3.q-pa-sm
                tk-ticketRightPanel(:ticketData="ticketData.data" @fetch:ticket-data="refreshTicketData")
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, provide } from 'vue'
import { useRoute, useRouter } from 'nuxt/app';
import { useHttpApi } from '~/composables/useHttpApi';
import { useDraggable } from '@vueuse/core'
import { LifeStep } from '~/utils';
import { useQuasar } from 'quasar';
import type { components } from '#build/types/service-api'
type Ticket = components['schemas']['Ticket']

const route = useRoute()
const router = useRouter()
const id = ref<string>('')
const $q = useQuasar()

const { data: ticketData, refresh, error } = await useHttpApi(`/tickets/ticket/${route.params.id}`, {
    method: 'get'
})

const refreshTicketData = () => {
    refresh()
    // router.go(0)
}

const updateTicketData = (ticket: { field: string, value: any }) => {
    ticketData.value.data[ticket.field] = ticket.value
    // console.log(ticket, ticketData.value.data[ticket.field])
}

const isDisabledTicket = computed(() => {
    return ticketData.value.data.lifestep === LifeStep.CLOSED
})

provide('isDisabledTicket', isDisabledTicket)

</script>

<style lang="css" scoped>
.mainContent {
    height: calc(100% - 50px);
}
</style>

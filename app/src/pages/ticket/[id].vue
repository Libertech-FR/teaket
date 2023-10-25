<template lang="pug">
q-page.row.items-stretch
    .col-12
        .row(style="height: 100%")
            //- .col-12.col-md-2.q-pa-sm
            //-     tk-ticketLeftPanel(:sequence="ticketData.data.sequence")
            .col-12.col-md-9.q-pa-sm
                tk-ticketMainPanel(:sequence="ticketData.data.sequence" :subject="ticketData.data.subject" :ticketData="ticketData.data" ref='mainPanelRef')
            .col-12.col-md-3.q-pa-sm
                tk-ticketRightPanel(v-model="ticketData.data" @fetch:ticket-data="refreshThreadsList" @refresh:ticket-data='refresh')
</template>

<script lang="ts" setup>
import { ref, computed, provide } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'
import { useHttpApi } from "~/composables/useHttpApi"
import { LifeStep } from "~/utils"
import { useQuasar } from 'quasar'
import type { components } from "#build/types/service-api"
import { TkTicketMainPanel } from '#components'
type Ticket = components['schemas']['TicketDto']

const route = useRoute()
const router = useRouter()
const id = ref<string>('')
const $q = useQuasar()

const {
  data: ticketData,
  refresh,
  error,
} = await useHttpApi(`/tickets/ticket/{_id}`, {
  method: 'get',
  pathParams: {
    _id: `${route.params.id}`,
  },
})

const mainPanelRef = ref<InstanceType<typeof TkTicketMainPanel> | null>(null)
const refreshThreadsList = () => {
  mainPanelRef.value.$.exposed.refreshThreadsList()
}

const isDisabledTicket = computed(() => {
  return ticketData.value?.data?.lifestep <= LifeStep.CLOSED
})

provide('isDisabledTicket', isDisabledTicket)
</script>

<style lang="css" scoped>
.mainContent {
  height: calc(100% - 50px);
}
</style>

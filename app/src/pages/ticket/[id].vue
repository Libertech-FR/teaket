<template lang="pug">
q-splitter(v-model="splitterModel" separator-style="width: 8px" background-color="primary" class="full-height"  :limits="[20,80]")
  template(#before)
    tk-ticketMainPanel(:sequence="ticketData.data.sequence" :subject="ticketData.data.subject" :ticketData="ticketData.data" ref='mainPanelRef')
  template(#after)
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
const splitterModel = ref(80)
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
  mainPanelRef.value?.$.exposed?.refreshThreadsList()
}

const isDisabledTicket = computed(() => {
  if (!ticketData.value.data?.lifestep) return true
  return ticketData.value?.data?.lifestep <= LifeStep.CLOSED
})

provide('isDisabledTicket', isDisabledTicket)
</script>

<style lang="css" scoped>
.mainContent {
  height: calc(100% - 50px);
}
</style>

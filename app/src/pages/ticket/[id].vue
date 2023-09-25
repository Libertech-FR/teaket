<template lang="pug">
q-page.row.items-stretch
    .col-12
        .row(style="height: 100%")
            .col-12.col-md-2.q-pa-sm
                tk-ticketLeftPanel(:sequence="ticketData.data.sequence")
            .col-12.col-md-6.q-pa-sm
                tk-ticketMainPanel(:sequence="ticketData.data.sequence" :subject="ticketData.data.subject" :disabled="disabled")
            .col-12.col-md-4.q-pa-sm
                tk-ticketRightPanel(:ticketData="ticketData.data" @update:ticket-data="onUpdateTicketData" :disabled="disabled")
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'nuxt/app';
import { useHttpApi } from '~/composables/useHttpApi';
import { useDraggable } from '@vueuse/core'
import { LifeStep } from '~/utils';
const route = useRoute()
const router = useRouter()
const id = ref<string>('')
const { data: ticketData, refresh } = await useHttpApi(`/tickets/ticket/${route.params.id}`, {
    method: 'get'
})

const onUpdateTicketData = () => {
    refresh()
    // router.go(0)
}

const previousUrl = route.redirectedFrom

const disabled = computed(() => {
    return ticketData.value.data.lifestep === LifeStep.CLOSED
})

</script>

<style lang="css" scoped>
.mainContent {
    height: calc(100% - 50px);
}
</style>

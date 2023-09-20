<template lang="pug">
q-page.row.items-stretch
    .col-12
        .row(style="height: 100%")
            .col-12.col-md-2.q-pa-sm
                tk-ticketLeftPanel(:sequence="ticketData.data.sequence")
            .col-12.col-md-6.q-pa-sm
                tk-ticketMainPanel(:sequence="ticketData.data.sequence" :subject="ticketData.data.subject")
            .col-12.col-md-4.q-pa-sm
                tk-ticketRightPanel(:ticketData="ticketData.data")
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'nuxt/app';
import { useHttpApi } from '~/composables/useHttpApi';
import { useDraggable } from '@vueuse/core'
const route = useRoute()
const id = ref<string>('')
const { data: ticketData } = await useHttpApi(`/tickets/ticket/${route.params.id}`, {
    method: 'get'
})

</script>

<style lang="css" scoped>
.mainContent {
    height: calc(100% - 50px);
}
</style>

<template lang="pug">
.column
    .row.q-my-md.q-px-sm
        q-breadcrumbs 
            q-breadcrumbs-el(to="/") Accueil
            q-breadcrumbs-el(to="/tickets") Tickets
            q-breadcrumbs-el(:label="ticketData.data.sequence")
    .row.q-gutter-md(style={'min-height': 'auto'})
        .col-2
            tk-ticketLeftPanel
        .col-6
            tk-ticketMainPanel()
        .col-3
            tk-ticketRightPanel(:ticketData="ticketData.data")
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'nuxt/app';
import { useHttpApi } from '~/composables/useHttpApi';

const route = useRoute()
const id = ref<string>('')
const { data: ticketData } = await useHttpApi(`/tickets/ticket/${route.params.id}`, {
    method: 'get'
})

onMounted(async () => {

})



</script>
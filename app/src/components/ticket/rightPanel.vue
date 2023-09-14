<template lang="pug">
q-list
    q-expansion-item(label="Enveloppe")
        q-card 
            q-card-section
                span {{ ticketData.envelope }}
    q-expansion-item(label="Informations")
        q-card 
            q-card-section
                span {{  ticketData.project }} Type: {{ ticketData.type }} {{ ticketData.priority }} {{ ticketData.impact }} {{ ticketData.state }} {{ ticketData.sla }}
    q-expansion-item(label="Cycle de vie")
        q-card 
            q-card-section
                span {{ ticketData }}
span {{ ticketData }}
</template>

<script lang="ts" setup>
defineProps({
    ticketData: {
        type: Object,
        required: true
    }
})
</script>
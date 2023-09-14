<template lang="pug">
q-list
    q-expansion-item(label="Enveloppe")
        q-card 
            q-card-section
                q-input
    q-expansion-item(label="Informations")
        q-card 
            q-card-section
                q-input
    q-expansion-item(label="Cycle de vie")
        q-card 
            q-card-section
                q-input
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
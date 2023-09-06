
<template lang="pug">
div
    q-btn(@click="refresh") refresh
    span Tickets
    div {{ data?.data }}
    div {{ pending }}
    div.text-error {{ error }}
    
</template>

<script lang="ts" setup>
import { useApiFetch } from "../composables/useApiFetch";

const { data, pending, error, refresh } = useApiFetch('tickets/ticket')

</script>
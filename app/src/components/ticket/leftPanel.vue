<template lang="pug">
q-card.bg-gray-4
    q-card-section
        .text-h6 Autres sections
    q-separator(inset)
    q-card-actions(align="center" vertical)
        q-btn(color="primary" flat) Mes tickets
        q-btn(color="primary" flat) Tout les tickets
    q-separator(inset)
    q-card-actions(align="center" vertical)
        q-btn(v-for="projet in projets.data" color="primary" flat :key="projet.id" :to="`/ticket/${projet.id}`") {{ projet.name }}
    
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useHttpApi } from '~/composables/useHttpApi';
const { data: projets } = await useHttpApi(`core/project`)

</script>
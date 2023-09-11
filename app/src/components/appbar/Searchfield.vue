<template lang="pug">
q-input(v-model="search" label="Rechercher" standout dark).q-my-xs
    template(v-slot:append)
        q-icon( v-if="search === ''" name="mdi-magnify")
        q-icon( v-else name="mdi-close" @click="search = ''")
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const search = ref('')
</script>
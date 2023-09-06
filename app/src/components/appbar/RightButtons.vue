<template lang="pug">
div 
    q-btn(v-for="button in buttons" :key="button.icon" round flat :icon="`mdi-${button.icon}`" size="lg")
        q-tooltip.text-body2(transition-show="scale" transition-hide="scale") {{ button.name }}
    q-btn-dropdown(icon="mdi-account-circle-outline" round flat size="lg")
        q-list 
            q-item(v-for="button in buttons" :key="button.name")
                q-btn(flat :icon="`mdi-${button.icon}`" :label="button.name" color="primary")
</template>

<script lang="ts" setup>
const buttons = [
    { icon: 'cog', name: 'Paramètres', action: '' },
    { icon: 'bell', name: 'Notifications', action: '' },
    { icon: 'help', name: 'Aide', action: '' },

]
</script>
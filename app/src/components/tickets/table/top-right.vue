<template lang="pug">
q-btn-group(rounded flat)
    q-btn(flat icon="mdi-table-headers-eye" color="primary")
        q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Afficher/cacher des colones
        q-menu(max-width="350px" max-height="350px").q-pa-md
            .row
                .col-6(v-for="column in columns" :key="column.value")
                    q-toggle(:model-value="modelValue" @update:model-value="update($event)" :label="column.label" :val="column.name")
    q-btn(flat icon="mdi-refresh" @click="refresh" color="primary")
        q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Rafraichir
    q-btn(icon="mdi-plus" color="primary" @click="$router.push('/tickets/create')" disabled) Créer
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { defineProps } from 'vue'

const props = defineProps({
    columns: {
        type: Array as PropType<{ name: string, label: string, value: string }[]>,
        default: () => []
    },
    modelValue: {
        type: Array as PropType<string[]>,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

function update(value: string[]) {
    emit('update:modelValue', value)
}

function refresh() {
    emit('refresh')
}

</script>

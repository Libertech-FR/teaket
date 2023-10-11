<template lang="pug">
q-td
    q-icon(v-if="lifestep" :name="lifestep.icon" :color="lifestep.color" size="xs").q-mx-xs
    q-icon(v-if="type" :name="type.icon" :color="type.color" size="xs").q-mx-xs
    q-icon(v-if="state" :name="state.icon" :color="state.color" size="xs").q-mx-xs
</template>

<script lang="ts" setup>
import { inject, computed } from 'vue'
import { ref } from 'vue'
import { ticketType, lifeSteps } from "#imports";
import type { components } from '#build/types/service-api'
import type { PropType } from 'vue'
type State = components["schemas"]['StatesDto']
const states = inject<ref<State[]>>('stateFetch')

const props = defineProps({
    ticket: {
        type: Object as PropType<components["schemas"]['TicketDto']>,
        default: () => ({})
    }
})

const state = computed(() => {
    const findedState = states.value?.data.find((state: State) => {
        return state._id === props.ticket.state.id
    })
    if (!findedState) {
        return false
    }
    return findedState
})

const type = computed(() => {
    const findedType = ticketType.find(t => t.value === props.ticket.type)
    if (!findedType) {
        return false
    }
    return findedType
})

const lifestep = computed(() => {
    const lifeStep = lifeSteps.find(l => l.value === props.ticket.lifestep)
    if (!lifeStep) {
        return false
    }
    return lifeStep
})

</script>
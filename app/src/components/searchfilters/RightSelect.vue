<template lang="pug">
q-select(
    :options="lifeSteps"
)
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useHttpApi } from "~/composables/useHttpApi";
const { data, pending, error, refresh } = useHttpApi('core/categories')
const lifeSteps = [
    { label: 'Ouvert', value: 1 },
    { label: 'Clos', value: 0 },
]

</script>
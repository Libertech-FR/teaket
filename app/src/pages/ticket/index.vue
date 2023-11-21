<template lang="pug">
div
    tk-form-builder(:json="data.data")
    tk-form-builder(:json="data2.data")
</template>

<script lang="ts" setup>
const {
    data,
    refresh,
    error,
} = await useHttpApi(`/tickets/form/{_id}`, {
    method: 'get',
    pathParams: {
        _id: `65539756ed13b613ad02aa56`,
    },
})

const {
    data: data2,
    refresh: refresh2,
    error: error2,
} = await useHttpApi(`/tickets/form/{_id}`, {
    method: 'get',
    pathParams: {
        _id: `65548e6982b5055708b80f38`,
    },
})
</script>
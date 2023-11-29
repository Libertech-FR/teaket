<template lang="pug">
tk-form-builder(:json="data.data" :model-value="data2.data")
  template(#top-actions)
    q-btn(@click="refresh" label="refresh" icon="mdi-refresh" flat)
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
} = await useHttpApi(`/tickets/ticket/{_id}`, {
  method: 'get',
  pathParams: {
    _id: `6560c79f45074e2f2285a2e2`,
  },
})

</script>
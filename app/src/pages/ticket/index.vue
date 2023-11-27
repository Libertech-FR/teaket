<template lang="pug">
tk-form-builder(:json="data.data")
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

</script>
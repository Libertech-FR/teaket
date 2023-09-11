<template lang='pug'>
div
  tk-hook(name="accueil" :data='{exemple: 1}' debug)
  span Accueil
  tk-hook(name="index.accueil.bottom")
  q-btn(@click="call") Call
</template>

<script lang='ts' setup>
const call = () => {
  const { data } = useHttpApi('/tickets/ticket')
}
</script>

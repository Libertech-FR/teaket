<template lang="pug">
q-radio(v-bind="$attrs")
  template(v-for="(_, name) in $slots" v-slot:[name]="slotData")
    slot(:name="name" v-bind="slotData")
</template>
    
<script setup lang="ts">
</script>
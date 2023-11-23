<template lang="pug">
q-checkbox(v-bind="attrs" v-on="listeners")
  template(v-for="(_, name) in $slots" v-slot:[name]="slotData")
    slot(:name="name" v-bind="slotData")
</template>
    
<script setup lang="ts">
</script>
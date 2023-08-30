<template>
  <div>
  <template v-for="(customSlot, key) in accueilCustomSlot">
    <component v-if='customSlot.componentName' :key='key' :is="customSlot.componentName"/>
  </template>
  <!-- <AccueilComponent/> -->
  <pre v-html="JSON.stringify(config)"></pre>
  accueil
  <hook name="index.accueil.bottom" v-bind="config"/>
  </div>
</template>

<script setup>
import {resolveComponent, computed} from 'vue'
import {useAppConfig} from '#imports'
import {sort} from 'radash'

const config = useAppConfig()
const accueilCustomSlot = sort(config.customSlots.accueil, (list) => list.priority, true)
// export default {
//   setup() {
//     const config = useAppConfig()
//     console.log('config', config)
//     return {
//       middleware: config.customSlots,
//       // accueilSlot: resolveComponent(config.customSlots.accueil)
//     }
//   },
//   data: () => ({
//     currentComponent: null,
//   }),
//   mounted() {
//     const config = useAppConfig()
//     console.log('config', config)
//     this.currentComponent = resolveComponent(config.customSlots.accueil)
//   }
// }
</script>

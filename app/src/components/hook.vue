<!--suppress JSUnusedLocalSymbols -->
<template lang='pug'>
div(:id='"tk-hook:" + name')
  template(v-for="(customSlot, key) in customSlots")
    pre.bg-red.text-white(v-if='debug' v-html="JSON.stringify({name, customSlot, data}, null, 2)")
    component(
      v-if='customSlot.componentName'
      :key='key'
      :is="customSlot.componentName"
      v-bind="{...customSlot.data, ...data}"
    )
</template>

<script lang='ts' setup>
import { useAppConfig } from '#imports'
import { sort } from 'radash'

//TODO: Convert to a sdk repository and publish it on npm for 3rd-party extensions
interface CustomSlotInterface {
  componentName: string
  priority?: number
  data?: Record<string, any>
}

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  debug: {
    type: Boolean,
    default: false,
  },
})

const config = useAppConfig()
const customSlots = computed(() => {
  if (config.customSlots.hasOwnProperty(props.name)) {
    const configCustomSlots = config.customSlots as Record<string, CustomSlotInterface[]>
    return sort(configCustomSlots[props.name], (list: CustomSlotInterface) => list.priority || 0, true)
  }
})
</script>

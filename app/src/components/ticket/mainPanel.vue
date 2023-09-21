<template lang="pug">
q-card(style="height: 100%").column
  q-toolbar.col-1
    q-toolbar-title {{ sequence }} | {{ subject }}
  q-scroll-area.col-8(ref="chatScroll")
    div(v-if="threads.total === 0").flex.items-center.justify-center
      span Aucun message
    div(v-for='(value, key) in getMessageByDay' :key='key')
      q-chat-message
        template(v-slot:label)
          span {{ key }}
          q-separator(inset)
      div(v-for="(message, index) in value" :id="index").q-mx-md
        //- div(v-for="fragment in message.fragments")
        q-chat-message(
          :sent="message.metadata.createdBy === user.username"
          :name="message.metadata.createdBy" size="10"
        )
          template(v-slot:stamp)
            span {{ getTimeFrom(message.metadata.createdAt) }}
              q-tooltip.text-body2 {{ getHour(message.metadata.createdAt) }}
          template(v-slot:default)
            div
              q-chip(v-for='file in message.attachement' :key='file.id' icon="mdi-paperclip" dense size='md' :label="file.message")
              q-separator.q-my-xs(v-if="message.fragments.file")
              div(v-for='raw in message.fragments.raw' v-html="raw.message")
  tk-SearchfiltersThreads
  q-editor(
    v-model="message" placeholder="Votre message ..." v-model:fullscreen="isFullscreen"
    :definitions="editorDefinitions" ref="dropZoneRef"
    :toolbar="[['left','center','right','justify'],['bold','italic','underline','strike'],['undo','redo'],['attach','send'],['fullscreen']]"
  ).col
  //- .col-1(ref="dropZoneRef").bg-grey-3.items-center.justify-center.q-pa-md
  //-   q-icon(name="mdi-paperclip" size="md" :class="isOverDropZone ? 'text-primary' : 'text-grey-5'")
  //-   span.q-ml-md(:class="isOverDropZone ? 'text-primary' : 'text-grey-5'") Déposer un fichier

</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'nuxt/app';
import { useHttpApi } from '~/composables';
import { useDayjs, usePinia } from "#imports";
import { generateMongoId } from '~/utils';
import type { Fragments, Threads } from '~/types';
import type { components } from '#build/types/service-api'
import { ThreadType, threadTypes } from '~/utils';
import { useDropZone } from '@vueuse/core'

type ThreadDto = components['schemas']['ThreadDto']
type FragmentPartDto = components["schemas"]["FragmentPartDto"]
type ThreadCreateDto = components['schemas']['ThreadCreateDto']

const dayjs = useDayjs()
const store = usePinia()
const route = useRoute()
const user = store.state.value.auth.user
const props = defineProps({
  sequence: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  }
})

onMounted(() => {
  scroll()
})

const chatScroll = ref(null)
const baseQuery = ref({
  "filters[ticketId]": `${route.params.id}`,
  "sort[metadata.createdAt]": 'asc',
  "limit": 999,
})

const isFullscreen = ref(false)
const message = ref('')
const dropZoneRef = ref<HTMLDivElement>()
const { data: threads } = await useHttpApi(`tickets/thread`, {
  method: 'get',
  query: computed(() => {
    return {
      ...baseQuery.value,
      ...route.query
    }
  })
})


const onDrop = (files: File[] | null) => {
  console.log('drop')
  console.log(files)
}
const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)

const getTimeFrom = (time: string) => {
  return dayjs().to(dayjs(time))
}

const getHour = (time: string) => {
  return dayjs(time).format('DD-MM-YYYY HH:mm')
}

const scroll = () => {
  const target = chatScroll.value?.getScrollTarget()
  chatScroll.value?.setScrollPosition('vertical', target.scrollHeight, 0)
}

const getThreadFragments = (thread: ThreadDto): Fragments => {
  return thread.fragments.reduce((acc: Fragments, fragment) => {
    const disposition = fragment.disposition
    if (!acc[disposition]) acc[disposition] = []
    acc[disposition]?.push(fragment)
    return acc as Fragments
  }, {})
}

const sendMessage = async () => {
  const payload: ThreadCreateDto = {
    ticketId: generateMongoId(route.params.id.toString()),
    fragments: [
      {
        id: generateMongoId(),
        disposition: 'raw',
        message: message.value
      }
    ],
    metadata: {
      createdBy: user.username,
      createdAt: dayjs().toISOString(),
      lastUpdatedAt: dayjs().toISOString(),
      lastUpdatedBy: user.username
    },
    type: ThreadType.OUTGOING
  }
  const { data: thread } = await useHttpApi(`tickets/thread`, {
    method: 'post',
    body: payload
  })
  threads.value?.data.push(thread.value?.data)
  message.value = ''
  scroll()
}

const editorDefinitions = ref({
  send: {
    tip: 'Envoyer',
    icon: 'mdi-send',
    label: 'Envoyer',
    handler: sendMessage
  },
  attach: {
    tip: 'Joindre un fichier',
    icon: 'mdi-paperclip',
    label: 'Joindre un fichier',
    handler: () => {
      console.log('joindre')
    }
  },
  fullscreen: {
    tip: 'Plein écran',
    icon: 'mdi-fullscreen',
    label: 'Plein écran',
    handler: () => {
      isFullscreen.value = !isFullscreen.value
    }
  }
})

const getMessageByDay = computed((): Threads => {
  return threads.value?.data.reduce((acc: Threads, thread: ThreadDto) => {
    const day = dayjs(thread.metadata.createdAt).format('DD-MM-YYYY')
    const newTread = {
      ...thread,
      fragments: getThreadFragments(thread)
    }
    if (!acc[day]) acc[day] = []
    acc[day].push(newTread)
    return acc
  }, {})
})

</script>
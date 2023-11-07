<template lang="pug">
div
    div(v-for="(fragment, fragId) in props.data.fragments", :key='fragId').row
        q-chat-message(
            :sent="props.data.metadata.createdBy === user.username"
            :name="props.data.metadata.createdBy" size="12"
        ).col-11
            template(v-slot:stamp)
                q-separator.q-my-xs
                .row.items-center
                    q-icon(name="mdi-email").q-mx-sm
                    span {{ getTimeFrom(props.data.metadata.createdAt) }}
                        q-tooltip.text-body2 {{ getHour(props.data.metadata.createdAt) }}
            template(v-slot:default)
                div
                    div(v-for='(raw, key) in props.data.fragments.raw' :key='key' v-html="raw.message.data")
                    object(
                      v-for='(file, key) in props.data.fragments.file'
                      :key='key'
                      :ref="el => { objectIframe[file.filestorage.id] = el }"
                      :data='"http://host.docker.internal:7100" + file.filestorage.link'
                      width='100%'
                      height='400px'
                      style="background: white;"
                    )
                      pre.q-ma-none.q-pa-sm(style='color: red; background: white;')
                        | Impossible d'afficher le contenu du mail&nbsp;
                        a(:href='"http://host.docker.internal:7100" + file.filestorage.link' target='_blank') {{ file.filestorage.name || file.filestorage.id }}
                    q-separator.q-my-xs(v-if="props.data.attachments.length > 0")
                    a(v-for='(attachment, key) in props.data.attachments' :key='key' :href="'http://host.docker.internal:7100' + attachment.link" target="_blank")
                      q-chip(icon="mdi-paperclip" text-color="white" color="primary" dense size='md' :label="attachment.name")
        .col.flex.items-center.q-pa-sm.column.q-gutter-sm
            q-btn(round size="md" icon="mdi-share" color="primary" @click="emailReponse(props.data)")
            q-btn(round size="md" icon="mdi-dots-vertical" color="primary")
</template>

<script lang="ts" setup>
import type { components } from '#build/types/service-api'
import { onMounted, onBeforeUpdate, ref } from 'vue'
import { useRoute } from 'nuxt/app'
import { useDayjs, useHttpApi, usePinia } from '#imports'
import { useQuasar } from 'quasar'
type ThreadDto = components['schemas']['ThreadDto']

const objectIframe = ref<HTMLObjectElement[]>([])

onBeforeUpdate(() => {
  objectIframe.value = []
})

onMounted(() => {
  scroll()
  window.addEventListener('message', function (e) {
    if (e.data.type === 'iframeInfo') {
      if (!objectIframe.value[e.data.id]) return
      objectIframe.value[e.data.id].style.height = e.data.scrollHeight + 'px'
    }
  })
})

const props = defineProps<{
  data: ThreadDto
}>()

const dayjs = useDayjs()
const store = usePinia()
const route = useRoute()
const $q = useQuasar()
const user = store.state.value.auth.user

const emit = defineEmits(['email:response'])
const emailReponse = async (thread: ThreadDto) => {
  console.log('thread', thread)
  const { data, error } = await useHttpApi(`/core/filestorage/{_id}/raw`, {
    method: 'get',
    pathParams: {
      _id: thread.fragments.file[0]?.filestorage?.id,
    },
    query: {
      mime: 'message/partial',
    },
  })
  console.log('emailReponse', data.value)
  emit('email:response', {
    ...thread.mailinfo,
    message: data?.value,
  })
}

const getTimeFrom = (time: string) => {
  return dayjs().to(dayjs(time))
}

const getHour = (time: string) => {
  return dayjs(time).format('DD-MM-YYYY HH:mm')
}
</script>

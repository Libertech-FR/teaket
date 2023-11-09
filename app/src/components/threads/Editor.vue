<template lang="pug">
.row.q-py-xs.full-height.q-gutter-none
  .col-1
    q-btn(icon="mdi-paperclip" size="md" :class="isOverDropZone ? 'text-primary' : 'text-grey-5'" flat ref="dropZoneRef").text-caption.q-pa-none.fit
      q-badge(floating) {{ attachements.length }}
      q-tooltip.text-body2 Glissez vos fichiers ici
  .col-10.full-height
    q-editor(
      v-model="message" placeholder="Votre message ..." dense
        :disable="isDisabledTicket" :definitions="editorDefinitions"
      :toolbar="editorToolbar" min-height="0px" :max-height="editorContentMaxHeight+'px'"
      style="height: 100%" ref="editorRef"
    )
  .col-1
    .column.full-height
      q-btn(
        icon="mdi-email" size="md" text-color="primary" color="grey-2" square unelevated
        @click="isFullscreen = true" :disable="isDisabledTicket"
      ).col
        q-tooltip.text-body2 Envoyer par mail
      q-separator
      q-btn(
        icon="mdi-send" size="md" text-color="primary" color="grey-2" square unelevated
        @click="noteModale" :disable="isDisabledTicket || message === ''"
      ).col
        q-tooltip.text-body2(v-html="message === '' ? 'Veuillez entrer un message' : 'Envoyer une note'")
  tk-threads-mail-dialog( 
    :isOpened="isFullscreen" :thread-id="currentThreadId"
    @closeDialog="isFullscreen = false" @clear="clear"
    :mailInfo="mailInfo" :message="message" :attachements="attachements"
    :isDisabledTicket="isDisabledTicket" :editor="{definitions: editorDefinitions, toolbar: editorToolbar}"
  )
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'
import { useHttpApi } from '~/composables'
import { useDayjs, usePinia } from '#imports'
import { generateMongoId } from '~/utils'
import type { components } from '#build/types/service-api'
import { ThreadType, threadTypes } from '~/utils'
import { useDropZone, useResizeObserver } from '@vueuse/core'
import { FsType } from '~/utils'
import { useQuasar } from 'quasar'
import ObjectID from 'bson-objectid'
type FsPart = components['schemas']['FsPart']
type Entity = components['schemas']['Entity']

const isDisabledTicket = inject<ref<boolean>>('isDisabledTicket')
const emit = defineEmits(['refreshThreadsList'])
const dayjs = useDayjs()
const store = usePinia()
const route = useRoute()
const $q = useQuasar()
const user = store.state.value.auth.user

onMounted(() => {
  currentThreadId.value = generateMongoId()
})

const {
  data: entities,
  pending: entitiesPending,
  refresh: entitiesRefresh,
  error: entitiesError,
} = await useHttpApi('/core/entities', {
  method: 'get',
})
if (entitiesError.value) {
  $q.notify({
    message: 'Erreur lors de la recupération des entités',
    color: 'negative',
  })
}

const observers = computed(() => {
  return entities.value?.data.reduce((acc: { id: string; name: string; type: number }[], entity: Entity) => {
    if (entity.type <= EntityType.OTHER) {
      acc.push({
        id: entity._id,
        name: entity.profile.commonName,
        type: entity.type,
      })
    }
    return acc
  }, [])
})
const { onDrop, removeAttachment } = useUploadFile(isDisabledTicket)

const attachements = ref<FsPart[]>([])
const dropZoneRef = ref<HTMLDivElement>()
const dropZoneDialogRef = ref<HTMLDivElement>()
const { isOverDropZone } = useDropZone(dropZoneRef, onDropAction)
const { isOverDropZone: isOverDropZoneDialog } = useDropZone(dropZoneDialogRef, onDropAction)
const currentThreadId = ref<ObjectID | null>(null)

async function onDropAction(file: File[] | null) {
  const path = `/ticket/${route.params.id}/attachement/${currentThreadId.value}`
  const newAttachments = await onDrop(file, path)
  attachements.value = [...attachements.value, ...newAttachments]
}

const isFullscreen = ref(false)
const mailInfo = ref({
  // from: '',
  to: [],
  cc: [],
  subject: '',
})
type MailinfoPartDto = components['schemas']['MailinfoPartDto']
const emailReponse = (data: MailinfoPartDto & { message?: string }) => {
  mailInfo.value.to = [data.from.address]
  // mailInfo.value.from = data.to[0].address
  mailInfo.value.subject = data.subject.startsWith('Re:') ? data.subject : `Re:${data.subject}`
  isFullscreen.value = true
  if (data.message) message.value = data.message
}

// Manage editor
const threadType = ref(threadTypes[0])
const message = ref('')
const noteType = ref(null)
function noteModale() {
  $q.dialog({
    title: 'Quel type de note voulez vous envoyer ?',
    message: message.value,
    html: true,
    options: {
      type: 'radio',
      model: '',
      isValid: (val: ThreadType) => val !== '',
      items: [
        { label: 'Note interne', value: ThreadType.INTERNAL },
        { label: 'Note externe', value: ThreadType.EXTERNAL },
      ]
    },
    cancel: true,
  })
    .onOk((data: ThreadType) => {
      sendMessage(data)
    })
    .onCancel(() => {
      $q.notify({
        message: 'Note annulée',
        color: 'negative',
      })
    })
}

async function sendMessage(type: ThreadType = ThreadType.OUTGOING) {
  const body: components['schemas']['ThreadCreateDto'] & { _id: string } = {
    _id: currentThreadId.value?.toHexString() || '',
    attachments: attachements.value,
    ticketId: generateStringMongoId(route.params.id.toString()),
    fragments: [
      {
        id: generateStringMongoId(),
        disposition: 'raw',
        message: message.value,
      },
    ] as components['schemas']['FragmentPartDto'][],
    mailinfo: {
      account: 'clement.mail_mail.libertech.fr',
      subject: mailInfo.value.subject,
      to: mailInfo.value.to,
      cc: mailInfo.value.cc,
    },
    metadata: {
      createdBy: user.username,
      createdAt: dayjs().toISOString(),
      lastUpdatedAt: dayjs().toISOString(),
      lastUpdatedBy: user.username,
    },
    type,
  }
  const { data: thread, error } = await useHttpApi(
    `/tickets/thread`,
    {
      method: 'post',
      body,
    },
    {
      message: "Impossible d'envoyer le message",
      color: 'negative',
    },
  )
  if (error.value) return

  message.value = ''
  attachements.value = []
  currentThreadId.value = generateMongoId()
  isFullscreen.value = false
  $q.notify({
    message: 'Message envoyé',
    type: 'positive',
  })
  emit('refreshThreadsList')
}
const editorDefinitions = computed(() => ({
  fullscreen: {
    tip: 'Plein écran',
    icon: isFullscreen.value ? 'mdi-fullscreen-exit' : 'mdi-fullscreen',
    label: isFullscreen.value ? 'Quitter le plein écran' : 'Plein écran',
    handler: () => {
      isFullscreen.value = !isFullscreen.value
    },
  },
}))
const editorToolbar = computed(() => {
  return [
    ['left', 'center', 'right', 'justify'],
    ['bold', 'italic', 'underline', 'strike'],
    ['undo', 'redo'],
    // ['fullscreen']
  ]
})

const isDisabledInternalButton = computed(() => {
  return isDisabledTicket.value || mailInfo.value.to.length !== 0
})

const isDisabledEmailButton = computed(() => {
  return isDisabledTicket.value || mailInfo.value.to.length === 0
})

function clear() {
  mailInfo.value = {
    // from: '',
    to: [],
    cc: [],
    subject: '',
  }
  message.value = ''
  attachements.value = []
}

const editorRef = ref<HTMLDivElement>()
const editorContentMaxHeight = ref(0)
useResizeObserver(editorRef, (entries) => {
  editorContentMaxHeight.value = entries[0].contentRect.height - 32
})

defineExpose({
  emailReponse,
})
</script>
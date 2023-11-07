<template lang="pug">
.column.full-height.q-col-gutter-none.q-gutter-none
  .col-11
    .row.q-py-sm.full-height.q-gutter-none.q-col-gutter-none
      q-btn(icon="mdi-paperclip" label="Glissez vos fichiers ici"
        size="md" :class="isOverDropZone ? 'text-primary' : 'text-grey-5'" flat ref="dropZoneRef"
      ).col-1.full-height
        q-badge(floating) {{ attachements.length }}
      //- client-only
      //-   tk-tiptap-editor(v-model="message" ref="editorDialog")
      q-editor(
        v-model="message" placeholder="Votre message ..."
        :definitions="editorDefinitions" :disable="isDisabledTicket"
        :toolbar="editorToolbar" height="100%"
      ).col-10.full-height
        template(#threadTypes)
          q-btn-dropdown(
            v-model="threadType" :options="threadTypes"
            no-wrap unelevated no-caps dense flat
            label="Type de thread" :icon="threadType.icon" :color="threadType.color"
          )
            q-list(dense)
              q-item(clickable v-for="(threadType, key) in threadTypes" :key="key" v-ripple tag="label")
                q-item-section
                  q-item-label {{ threadType.label }}
      q-btn(
        icon="mdi-send" size="md" color="primary" flat
        @click="isFullscreen = true" :disable="isDisabledTicket"
      ).col-1.full-height
        q-tooltip.text-body2 Envoyer
  .col.bg-grey-3(style="height: 30px")
    q-scroll-area(style="width: 100%")
      q-virtual-scroll(:items="attachements" virtual-scroll-horizontal v-slot="{item}")
        q-chip(:key="item.id" icon="mdi-paperclip" dense size='md' :label="item.name" removable @remove="removeAttachment(item.id)")

  q-dialog(v-model="isFullscreen")
    q-card
      q-card-section.bg-grey-2
        //- q-input(dense label="From" v-model="mailInfo.from" :disable="isDisabledTicket")
        tk-form-autocomplete(
          apiUrl="/core/entities"
          optionLabel="publicEmail"
          optionValue="publicEmail"
          searchField="publicEmail"
          :emitValue="true"
          label="Destinataire"
          v-model="mailInfo.to"
          :addManualValue="true"
          use-chips dense
          :disabled="isDisabledTicket"
        )
        tk-form-autocomplete(
          apiUrl="/core/entities"
          optionLabel="publicEmail"
          optionValue="publicEmail" 
          searchField="publicEmail"
          :emitValue="true"
          label="Cc"
          v-model="mailInfo.cc"
          :addManualValue="true"
          use-chips dense
          :disabled="isDisabledTicket"
        )
        q-input(dense label="Sujet" v-model="mailInfo.subject" :disable="isDisabledTicket")
      q-card-section
        q-editor(
          min-height="50vh" min-width="50vw"
          v-model="message" placeholder="Votre message ..."
          :definitions="editorDefinitions"
          :toolbar="editorToolbar" class="q-pa-none"
          :readonly="isDisabledTicket" ref="dropZoneRef"
        )
      q-card-section.q-pa-sm
        div(ref="dropZoneDialogRef").row.center.bg-grey-3
          .col.text-center
            q-icon(name="mdi-paperclip" size="md" :class="isOverDropZoneDialog ? 'text-primary' : 'text-grey-5'")
            span.q-ml-md(:class="isOverDropZoneDialog ? 'text-primary' : 'text-grey-5'") Déposer un fichier
      q-card-section
        q-scroll-area(style="width: 100%; height: 100%")
          q-virtual-scroll(:items="attachements" virtual-scroll-horizontal v-slot="{item}")
            q-chip(v-for="(attachement, key) in attachements" :key="key" icon="mdi-paperclip" dense size='md' :label="attachement.name" removable @remove="removeAttachment(attachement.id)")

      .row
        q-btn(label="Envoyer en note interne" color="primary" icon="mdi-note" @click="sendMessage(ThreadType.INTERNAL)" :disable="isDisabledInternalButton").col-6
          q-tooltip(v-if='isDisabledInternalButton').text-body2
            span Champs 'Destinataire' non vide
        q-btn(label="Envoyer par mail" color="primary" icon="mdi-email" @click="sendMessage(ThreadType.OUTGOING)" :disable="isDisabledEmailButton").col-6
          q-tooltip(v-if='isDisabledEmailButton').text-body2
            span Champs 'Destinataire' vide
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

// Manage dropzone
const onDrop = (files: File[] | null) => {
  if (isDisabledTicket.value) {
    $q.notify({
      message: "Impossible d'envoyer le fichier, le ticket est fermé",
      type: 'negative',
    })
    return
  }
  if (!files) {
    $q.notify({
      message: "Impossible d'envoyer le fichier",
      type: 'negative',
    })
    return
  }
  for (const file of files) {
    uploadFile(file)
  }
}
const dropZoneRef = ref<HTMLDivElement>()
const dropZoneDialogRef = ref<HTMLDivElement>()
const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)
const { isOverDropZone: isOverDropZoneDialog } = useDropZone(dropZoneDialogRef, onDrop)

// Manage attachements
type FsPart = components['schemas']['IdfsPartDto']
type FilestorageCreateDto = components['schemas']['FilestorageCreateDto']
const attachements = ref<FsPart[]>([])
const currentThreadId = ref<ObjectID | null>(null)
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('namespace', 's3')
  formData.append('path', `/ticket/${route.params.id}/attachement/${currentThreadId.value}/${file.name}`)
  formData.append('type', FsType.FILE)
  const { data, error } = await useHttpApi(`/core/filestorage`, {
    method: 'post',
    body: formData as unknown as FilestorageCreateDto,
  })
  if (error.value) {
    $q.notify({
      message: "Impossible d'envoyer le fichier",
      type: 'negative',
    })
    return
  }
  const id = generateMongoId(data.value?.data?._id).toHexString()
  const fsPart: FsPart = {
    id,
    name: file.name,
    namespace: data.value?.data?.namespace || '',
    path: data.value?.data?.path || '',
    mime: data.value?.data?.mime || '',
  }
  attachements.value.push(fsPart)
  $q.notify('Fichier envoyé')
}

const removeAttachment = (id: string) => {
  const { data, error } = useHttpApi(`/core/filestorage/{_id}`, {
    method: 'delete',
    pathParams: {
      _id: id,
    },
  })
  if (error.value) {
    $q.notify({
      message: 'Impossible de supprimer le fichier',
      type: 'negative',
    })
    return
  }
  attachements.value = attachements.value.filter((attachement) => `${attachement.id}` !== id)
  $q.notify('Fichier supprimé')
}

const editorDialog = ref()
const isFullscreen = ref(false)
const mailInfo = ref({
  from: '',
  to: [],
  cc: [],
  subject: '',
})
type MailinfoPartDto = components['schemas']['MailinfoPartDto']
const emailReponse = (data: MailinfoPartDto) => {
  mailInfo.value.to = data.from.address
  mailInfo.value.from = data.to[0].address
  mailInfo.value.subject = data.subject.startsWith('Re:') ? data.subject : `Re:${data.subject}`
  isFullscreen.value = true
}

// Manage editor
const threadType = ref(threadTypes[0])
const message = ref('')
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
  return [['left', 'center', 'right', 'justify'], ['bold', 'italic', 'underline', 'strike'], ['undo', 'redo'], ['fullscreen']]
})

const isDisabledTicket = inject<ref<boolean>>('isDisabledTicket')
const isDisabledInternalButton = computed(() => {
  return isDisabledTicket.value || mailInfo.value.to.length !== 0
})

const isDisabledEmailButton = computed(() => {
  return isDisabledTicket.value || mailInfo.value.to.length === 0
})

defineExpose({
  emailReponse,
})
</script>

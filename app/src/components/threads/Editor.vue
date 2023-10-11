<template lang="pug">
.column
    .col-10
        .row(style="height: 100%")
            q-btn(icon="mdi-paperclip" label="Glissez vos fichiers ici"
                size="md" :class="isOverDropZone ? 'text-primary' : 'text-grey-5'" flat ref="dropZoneRef"
            ).col-1.bg-grey-2
                q-badge(floating) {{ attachements.length }}
            //- client-only
            //-   tk-tiptap-editor(v-model="message" ref="editorDialog")
            q-editor(
                v-model="message" placeholder="Votre message ..."
                :definitions="editorDefinitions" :disable="isDisabledTicket"
                :toolbar="editorToolbar" dense style="height: 100%"
            ).col
                template(v-slot:threadTypes)
                    q-btn-dropdown(
                        v-model="threadType" :options="threadTypes"
                        no-wrap unelevated no-caps dense flat
                        label="Type de thread" :icon="threadType.icon" :color="threadType.color"
                    )
                        q-list(dense)
                            q-item(clickable v-for="(threadType, key) in threadTypes" :key="key" v-ripple tag="label")
                                q-item-section
                                    q-item-label {{ type.label }}
            q-btn(
                icon="mdi-send" size="md" color="primary" flat
                @click="isFullscreen = true"
            ).col-1
                q-tooltip.text-body2 Envoyer

    q-scroll-area(style="width: 100%").col
        q-virtual-scroll(:items="attachements" virtual-scroll-horizontal v-slot="{item}")
            q-chip(:key="item.id" icon="mdi-paperclip" dense size='md' :label="item.name" removable @remove="removeAttachment(item.id)")

    q-dialog(v-model="isFullscreen")
        q-card
            q-card-section.bg-grey-2
                q-input(dense label="From" v-model="mailInfo.from" :disable="isDisabledTicket")
                q-input(dense label="To" v-model="mailInfo.to" :disable="isDisabledTicket")
                q-input(dense label="Copy" v-model="mailInfo.cc" :disable="isDisabledTicket")
                q-input(dense label="Subject" v-model="mailInfo.subject" :disable="isDisabledTicket")
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
                q-btn(label="Envoyer en note interne" color="primary" icon="mdi-note" @click="sendMessage(ThreadType.INTERNAL)" :disable="isDisabledTicket").col-6
                q-btn(label="Envoyer par mail" color="primary" icon="mdi-email" @click="sendMessage(ThreadType.OUTGOING)" :disable="isDisabledTicket").col-6
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject } from 'vue'
import { useRoute, useRouter } from 'nuxt/app';
import { useHttpApi } from '~/composables';
import { useDayjs, usePinia } from "#imports";
import { generateMongoId } from '~/utils';
import type { components } from '#build/types/service-api'
import { ThreadType, threadTypes } from '~/utils';
import { useDropZone, useResizeObserver } from '@vueuse/core'
import { FsType } from '~/utils'
import { useQuasar } from 'quasar';
import ObjectID from 'bson-objectid';

const emit = defineEmits(['refreshThreadsList'])
const isDisabledTicket = inject<boolean>('isDisabledTicket')

const dayjs = useDayjs()
const store = usePinia()
const route = useRoute()
const $q = useQuasar()
const user = store.state.value.auth.user

onMounted(() => {
    currentThreadId.value = generateMongoId()
})

// Manage dropzone
const onDrop = (files: File[] | null) => {
    if (isDisabledTicket) {
        $q.notify({
            message: 'Impossible d\'envoyer le fichier, le ticket est fermé',
            type: 'negative'
        })
        return
    }
    if (!files) {
        $q.notify({
            message: 'Impossible d\'envoyer le fichier',
            type: 'negative'
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
type FsPart = components["schemas"]["IdfsPartDto"]
type FilestorageCreateDto = components["schemas"]["FilestorageCreateDto"]
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
        body: formData as unknown as FilestorageCreateDto
    })
    if (error.value) {
        $q.notify({
            message: 'Impossible d\'envoyer le fichier',
            type: 'negative'
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
            _id: id
        }
    })
    if (error.value) {
        $q.notify({
            message: 'Impossible de supprimer le fichier',
            type: 'negative'
        })
        return
    }
    attachements.value = attachements.value.filter(attachement => `${attachement.id}` !== id)
    $q.notify('Fichier supprimé')
}

const editorDialog = ref()
const isFullscreen = ref(false)
const mailInfo = ref({
    from: '',
    to: '',
    cc: '',
    subject: ''
})
type MailinfoPartDto = components["schemas"]["MailinfoPartDto"]
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
    const { data: thread, error } = await useHttpApi(`/tickets/thread`, {
        method: 'post',
        body: {
            _id: currentThreadId.value?.toHexString(),
            attachments: attachements.value,
            ticketId: generateStringMongoId(route.params.id.toString()),
            fragments: [{
                id: generateStringMongoId(),
                disposition: 'raw',
                message: message.value
            }],
            metadata: {
                createdBy: user.username,
                createdAt: dayjs().toISOString(),
                lastUpdatedAt: dayjs().toISOString(),
                lastUpdatedBy: user.username
            },
            type
        }
    })

    console.log('thread', thread.value)
    console.log('error', error.value)

    if (error.value) {
        $q.notify({
            message: 'Impossible d\'envoyer le message',
            type: 'negative'
        })
        return
    }

    message.value = ''
    attachements.value = []
    currentThreadId.value = generateMongoId()
    isFullscreen.value = false
    $q.notify({
        message: 'Message envoyé',
        type: 'positive'
    })
    emit('refreshThreadsList')
}
const editorDefinitions = computed(() => (
    {
        fullscreen: {
            tip: 'Plein écran',
            icon: isFullscreen.value ? 'mdi-fullscreen-exit' : 'mdi-fullscreen',
            label: isFullscreen.value ? 'Quitter le plein écran' : 'Plein écran',
            handler: () => {
                isFullscreen.value = !isFullscreen.value
            }
        }
    }))
const editorToolbar = computed(() => {
    return [['left', 'center', 'right', 'justify'], ['bold', 'italic', 'underline', 'strike'], ['undo', 'redo'], ['fullscreen']]
})

defineExpose({
    emailReponse
})

</script>

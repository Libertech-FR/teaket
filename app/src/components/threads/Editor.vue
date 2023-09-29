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
                            q-item(clickable v-for="threadType in threadTypes" :key="type.value" v-ripple tag="label")
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
                q-input(dense label="From" v-model="mailInfo.from")
                q-input(dense label="To" v-model="mailInfo.to")
                q-input(dense label="Copy" v-model="mailInfo.cc")
                q-input(dense label="Subject" v-model="mailInfo.subject")
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
                        q-chip(v-for="attachement in attachements" :key="attachement.id" icon="mdi-paperclip" dense size='md' :label="attachement.name" removable @remove="removeAttachment(attachement.id)")

            .row
                q-btn(label="Envoyer en note interne" color="primary" icon="mdi-note" @click="sendMessage(ThreadType.INTERNAL)").col-6
                q-btn(label="Envoyer par mail" color="primary" icon="mdi-email" @click="sendMessage(ThreadType.OUTGOING)").col-6
                //- .col-1(ref="dropZoneRef").bg-grey-3.items-center.justify-center.q-pa-md
                //-   q-icon(name="mdi-paperclip" size="md" :class="isOverDropZone ? 'text-primary' : 'text-grey-5'")
                //-   span.q-ml-md(:class="isOverDropZone ? 'text-primary' : 'text-grey-5'") Déposer un fichier

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

type ThreadCreateDto = components['schemas']['ThreadCreateDto']
type FsPart = components["schemas"]["IdfsPartDto"]
type MailinfoPartDto = components["schemas"]["MailinfoPartDto"]

const emit = defineEmits(['refreshThreadsList'])

const dayjs = useDayjs()
const store = usePinia()
const route = useRoute()
const $q = useQuasar()
const user = store.state.value.auth.user

onMounted(() => {
    currentThreadId.value = generateMongoId()
})

const threadType = ref(threadTypes[0])
const isFullscreen = ref(false)
const message = ref('')
const dropZoneRef = ref<HTMLDivElement>()
const dropZoneDialogRef = ref<HTMLDivElement>()
const editorDialog = ref()
const currentThreadId = ref<ObjectID | null>(null)
const attachements = ref<FsPart[]>([])
const mailInfo = ref({
    from: '',
    to: '',
    cc: '',
    subject: ''
})

const onDrop = (files: File[] | null) => {
    if (!files) return
    for (const file of files) {
        uploadFile(file)
    }
}

const { isOverDropZone } = useDropZone(dropZoneRef, onDrop)
const { isOverDropZone: isOverDropZoneDialog } = useDropZone(dropZoneDialogRef, onDrop)

const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('namespace', 's3')
    formData.append('path', `/ticket/${route.params.id}/attachement/${currentThreadId}/${file.name}`)
    formData.append('type', FsType.FILE)
    const { data, error } = await useHttpApi(`core/filestorage`, {
        method: 'post',
        body: formData
    })
    if (error.value) {
        $q.notify({
            message: 'Impossible d\'envoyer le fichier',
            type: 'negative'
        })
        return
    }
    const fsPart: FsPart = {
        id: data.value?.data._id,
        name: file.name,
        namespace: data.value?.data.namespace,
        path: data.value?.data.path,
        mime: data.value?.data.mime
    }
    attachements.value.push(fsPart)
    $q.notify('Fichier envoyé')
}

const emailReponse = (data: MailinfoPartDto) => {
    mailInfo.value.to = data.from.address
    mailInfo.value.from = data.to[0].address
    mailInfo.value.subject = data.subject.startsWith('Re:') ? data.subject : `Re:${data.subject}`
    isFullscreen.value = true
}

const removeAttachment = (id: string) => {
    const { data, error } = useHttpApi(`core/filestorage/${id}`, {
        method: 'delete'
    })
    if (error.value) {
        $q.notify({
            message: 'Impossible de supprimer le fichier',
            type: 'negative'
        })
        return
    }
    attachements.value = attachements.value.filter(attachement => attachement.id !== id)
    $q.notify('Fichier supprimé')
}

const sendMessage = (type: ThreadType = ThreadType.OUTGOING) => {
    const { data: thread, error } = useHttpApi(`tickets/thread`, {
        method: 'post',
        body: {
            _id: currentThreadId.value,
            attachments: attachements.value,
            ticketId: generateMongoId(route.params.id.toString()),
            fragments: [{
                id: generateMongoId(),
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
    $q.notify('Message envoyé')
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

const isDisabledTicket = inject('isDisabledTicket')

defineExpose({
    emailReponse
})

</script>
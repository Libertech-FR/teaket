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
                :definitions="editorDefinitions" 
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
                @click="sendMessage"
            ).col-1
                q-tooltip.text-body2 Envoyer

    q-scroll-area(style="width: 100%").col
        q-virtual-scroll(:items="attachements" virtual-scroll-horizontal v-slot="{item}")
            q-chip(:key="item.id" icon="mdi-paperclip" dense size='md' :label="item.name" removable @remove="removeAttachment(item.id)")

    q-dialog(v-model="isFullscreen")
        q-card
            q-card-section
                q-editor(
                    min-height="50vh" min-width="50vw"
                    v-model="message" placeholder="Votre message ..."
                    :definitions="editorDefinitions" 
                    :toolbar="editorToolbar" class="q-pa-none"
                    :disable="disabled" ref="dropZoneRef"
                )
            q-card-section.q-pa-sm
                div(ref="dropZoneDialogRef").row.center.bg-grey-3
                    .col.text-center
                        q-icon(name="mdi-paperclip" size="md" :class="isOverDropZoneDialog ? 'text-primary' : 'text-grey-5'")
                        span.q-ml-md(:class="isOverDropZoneDialog ? 'text-primary' : 'text-grey-5'") Déposer un fichier
            q-card-section
                q-chip(v-for="attachement in attachements" :key="attachement.id" icon="mdi-paperclip" dense size='md' :label="attachement.name" removable @remove="removeAttachment(attachement.id)")

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
import type { components } from '#build/types/service-api'
import { ThreadType, threadTypes } from '~/utils';
import { useDropZone, useResizeObserver } from '@vueuse/core'
import { FsType } from '~/utils'
import { useQuasar } from 'quasar';
import ObjectID from 'bson-objectid';

type ThreadCreateDto = components['schemas']['ThreadCreateDto']
type FsPart = components["schemas"]["IdfsPartDto"]

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
    console.log(error.value)
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

const sendMessage = async () => {
    const payload: ThreadCreateDto = {
        _id: currentThreadId,
        attachments: attachements.value,
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
    const { data: thread, error } = await useHttpApi(`tickets/thread`, {
        method: 'post',
        body: payload
    })
    if (error.value) {
        $q.notify({
            message: 'Impossible d\'envoyer le message',
            type: 'negative'
        })
        return
    }
    threads.value?.data.push(thread.value?.data)
    message.value = ''
    scroll()
    attachements.value = []
    $q.notify('Message envoyé')

}

const editorDefinitions = computed(() => (
    {
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

</script>
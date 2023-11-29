<template lang="pug">
q-dialog(:model-value="modelValue" @update:model-value="emit('update:model-value', $event)" ref="dialogRef" @show="onShow" @hide="emit('clear')")
    q-card(style="position: fixed" :style="style" ref="cardRef").resizable-card
        div.flex(style="flex-flow: column; height: 100%")
            q-toolbar(color="primary").bg-primary
                .fit.row( style="cursor: move" ref="handle")
                    q-toolbar-title.text-white Email
                    q-btn(
                        icon="mdi-close" flat round dense text-color="white" @click="emit('update:model-value', false)"
                    )
                        q-tooltip Fermer
            .q-pa-sm(:class='{"bg-grey-2": !$q.dark.isActive}')
                tk-form-autocomplete(
                    apiUrl="/core/entities"
                    optionLabel="publicEmail"
                    optionValue="publicEmail"
                    searchField="publicEmail"
                    :emitValue="true"
                    label="Destinataire"
                    v-model="emailInfo.to"
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
                    v-model="emailInfo.cc"
                    :addManualValue="true"
                    use-chips dense
                    :disabled="isDisabledTicket"
                )
                q-input(dense label="Sujet" v-model="emailInfo.subject" :disable="isDisabledTicket")
            .fit.q-pa-sm
                q-editor.fit(
                    height="100%" min-height="5rem"
                    v-model="email" placeholder="Votre message ..."
                    :definitions="editor.definitions"
                    :toolbar="editor.toolbar" class="q-pa-none"
                    :readonly="isDisabledTicket" ref="dropZoneRef"
                )
            .q-pa-sm
                div(ref="dropZoneRef" :class='{"bg-grey-2": !$q.dark.isActive, "bg-grey-14": $q.dark.isActive}').row.center
                    .col.text-center
                        q-icon(name="mdi-paperclip" size="md" :class="isOverDropZone || isOverDropZoneDialog ? 'text-primary' : 'text-grey-5'")
                        span.q-ml-md(:class="isOverDropZone || isOverDropZoneDialog ? 'text-primary' : 'text-grey-5'") Déposer un fichier
            .row.attachment-scroll.justify-center.items-center
                q-scroll-area(v-if="attachments.length > 0").fit
                    q-virtual-scroll(:items="attachments" virtual-scroll-horizontal v-slot="{item}")
                        q-chip(icon="mdi-paperclip" dense size='md' :label="item.name" removable @remove="removeAttachment(item.id)")
                .q-pa-sm(v-else).text-grey-5 Aucun fichier joint            
            .row.justify-around
                q-btn(label="Vider les champs" color="warning" icon="mdi-nuke" flat @click="clear")
                q-btn(label="Envoyer" color="primary" flat icon="mdi-email" @click="sendMessage(ThreadType.OUTGOING)")
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import type { QEditorProps } from 'quasar'
import { ref } from 'vue'
import { useRoute } from 'nuxt/app'
import { useHttpApi } from '~/composables'
import { generateMongoId } from '~/utils'
import type { components } from '#build/types/service-api'
import { useDropZone } from '@vueuse/core'
import { FsType } from '~/utils'
import { useQuasar } from 'quasar'
import ObjectID from 'bson-objectid'
import type { MailInfo, Attachement } from '/types'

type FsPart = components['schemas']['FsPart']
type Thread = components['schemas']['Thread']

const props = defineProps({
    threadId: {
        type: Object as PropType<ObjectID>,
        required: true
    },
    modelValue: {
        type: Boolean as PropType<boolean>,
        required: true
    },
    mailInfo: {
        type: Object as PropType<MailInfo>,
        default: () => {
            return {
                to: [],
                cc: [],
                subject: ''
            }
        }
    },
    message: {
        type: String as PropType<string>,
        default: ''
    },
    attachements: {
        type: Array as PropType<Attachement[]>,
        default: () => []
    },
    editor: {
        type: Object as PropType<{ toolbar: QEditorProps['toolbar'], definitions: QEditorProps['definitions'] }>,
        required: true
    },
    isDisabledTicket: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['sendMessage', 'update:model-value', "refreshThreadsList", "clear"])
const $q = useQuasar()
const route = useRoute()
const dayjs = useDayjs()
const store = usePinia()
const { onDrop, removeAttachment, attachments } = useUploadFile(toRef(props.isDisabledTicket))
const user = store.state.value.auth.user
const email = ref<string>('')
const emailAttachments = ref<FsPart[]>([])
const emailInfo = ref<MailInfo>({
    to: [],
    cc: [],
    subject: ''
})

const cardRef = ref<HTMLElement | null>(null)

const cardStyle = ref()
const dialogRef = ref<HTMLElement | null>(null)
const handle = ref<HTMLElement | null>(null)
const { x, y, style } = useDraggable(handle, {
    initialValue: {
        x: 100,
        y: 100,
    },
})
function onShow() {
    if (props.message !== '') email.value = props.message
    if (props.attachements.length > 0) {
        attachments.value = props.attachements
    }

    if (props.mailInfo.cc.length > 0) emailInfo.value.cc = props.mailInfo.cc
    if (props.mailInfo.to.length > 0) emailInfo.value.to = props.mailInfo.to
    if (props.mailInfo.subject !== '') emailInfo.value.subject = props.mailInfo.subject
}

const attachements = ref<FsPart[]>([])
const dropZoneRef = ref<HTMLDivElement>()
const { isOverDropZone } = useDropZone(dropZoneRef, onDropAction)
const { isOverDropZone: isOverDropZoneDialog } = useDropZone(dialogRef, onDropAction)
const currentThreadId = ref<ObjectID | null>(null)

async function onDropAction(file: File[] | null) {
    const path = `/ticket/${route.params.id}/attachement/${currentThreadId.value}`
    await onDrop(file, path)
}

async function sendMessage(type: ThreadType = ThreadType.OUTGOING) {
    const body: components['schemas']['ThreadCreateDto'] & { _id: string } = {
        _id: props.threadId.toHexString() || '',
        attachments: emailAttachments.value,
        ticketId: generateStringMongoId(route.params.id.toString()),
        fragments: [
            {
                id: generateStringMongoId(),
                disposition: 'raw',
                message: email.value,
            },
        ] as components['schemas']['FragmentPartDto'][],
        mailinfo: {
            account: 'clement.mail_mail.libertech.fr',
            subject: emailInfo.value.subject,
            to: emailInfo.value.to,
            cc: emailInfo.value.cc,
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

    email.value = ''
    attachements.value = []
    currentThreadId.value = generateMongoId()
    emit('closeDialog')
    $q.notify({
        message: 'Message envoyé',
        type: 'positive',
    })
    emit('refreshThreadsList')
}

function clear() {
    email.value = ''
    emailAttachments.value = []
    emailInfo.value = {
        to: [],
        cc: [],
        subject: ''
    }
    emit('clear')
}
</script>

<style lang="css">
.resizable-card {
    resize: both;
    min-width: 30vw !important;
    min-height: 50vh !important;
    max-width: 80vw !important;
    max-height: 90vh !important;
}

.attachment-scroll {
    min-height: 50px !important;
    height: 50px !important;
    max-height: 50px !important;
}
</style>
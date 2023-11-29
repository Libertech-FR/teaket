<template lang="pug">
q-dialog(:model-value="modelValue" @update:model-value="emit('update:model-value', $event)" ref="dialogRef" @show="onShow" @hide="emit('clear')")
    q-card(style="position: fixed" :style="style" ref="cardRef").resizable-card
        .fit(style="flex-flow: column")
            q-toolbar(color="primary").bg-primary
                .fit.flex.row( style="cursor: move" ref="handle")
                    q-toolbar-title.text-white Pieces jointes
                    q-btn(
                        icon="mdi-close" flat round dense text-color="white" @click="emit('update:model-value', false)"
                    )
                        q-tooltip(top) Fermer
            q-card-section.fit(:class='{"bg-grey-2": !$q.dark.isActive}').text-center
                q-icon(name="mdi-paperclip" size="md" :class="isOverDropZone ? 'text-primary' : 'text-grey-5'")
                span.q-ml-md(:class="isOverDropZone ? 'text-primary' : 'text-grey-5'") Déposer un fichier
            .q-pa-sm
                .row.center 
                    span Aucun fichier joint 

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
    modelValue: {
        type: Boolean as PropType<boolean>,
        required: true
    },
    attachements: {
        type: Array as PropType<Attachement[]>,
        default: () => []
    },
    isDisabledTicket: {
        type: Boolean,
        default: false
    },
    threadId: {
        type: Object as PropType<ObjectID>,
        required: true
    }
})
const test = ref([])
const uploaderRef = ref<HTMLElement | null>(null)
const emit = defineEmits(['sendMessage', 'update:model-value', "refreshThreadsList", "clear"])
const $q = useQuasar()
const route = useRoute()
const dayjs = useDayjs()

const { onDrop, uploadFile, removeAttachment, attachments } = useUploadFile(toRef(props.isDisabledTicket))
const cardRef = ref<HTMLElement | null>(null)
const handle = ref<HTMLElement | null>(null)
const { x, y, style } = useDraggable(handle, {
    initialValue: {
        x: 100,
        y: 100,
    },
})

const attachements = ref<FsPart[]>([])
const { isOverDropZone } = useDropZone(cardRef, onDropAction)

async function onDropAction(file: File[] | null) {
    if (!file) return
    const path = `/ticket/${route.params.id}/attachement/${props.threadId}`
    const newAttachments = await onDrop(file, path)
    attachements.value = [...attachements.value, ...newAttachments]
}

function clear() {
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
</style>
<template lang="pug">
div
    div(v-for="(fragment, fragId) in props.data.fragments", :key="fragId")
        q-chat-message(
            :sent="props.data.metadata.createdBy === user.username"
            :name="props.data.metadata.createdBy" size="10"
        )
            template(v-slot:stamp)
                .row.items-center
                    q-icon(name="mdi-laptop").q-mx-sm
                    span {{ getTimeFrom(props.data.metadata.createdAt) }}
                        q-tooltip.text-body2 {{ getHour(props.data.metadata.createdAt) }}
            template(v-slot:default)
                div
                    q-chip(v-for='(attachment, key) in props.data.attachments' :key='key' icon="mdi-paperclip" text-color="white" color="primary" dense size='md' :label="attachment.name")
                    q-separator.q-my-xs(v-if="props.data.fragments.file")
                    div(v-for='(raw, key) in props.data.fragments.raw' :key='key' v-html="raw.message")
    </template>

<script lang="ts" setup>
import type { components } from '#build/types/service-api'
import { useRoute } from 'nuxt/app';
import { useDayjs, usePinia } from "#imports";
import { useQuasar } from 'quasar';
type ThreadDto = components['schemas']['ThreadDto']

const props = defineProps<{
    data: ThreadDto
}>()

const dayjs = useDayjs()
const store = usePinia()
const route = useRoute()
const $q = useQuasar()
const user = store.state.value.auth.user


const getTimeFrom = (time: string) => {
    return dayjs().to(dayjs(time))
}

const getHour = (time: string) => {
    return dayjs(time).format('DD-MM-YYYY HH:mm')
}

</script>

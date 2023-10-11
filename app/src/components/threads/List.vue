<template lang="pug">
q-scroll-area(ref="chatScroll")
    div(v-if="threads.total === 0").flex.items-center.justify-center
        span Aucun message
    div(v-for='(value, key) in getMessageByDay' :key='key')
        q-chat-message
            template(v-slot:label)
                span {{ key }}
                q-separator(inset)

        div(v-for="(message, index) in value" :id="message._id" :key='index').q-mx-md
            component(
                v-if="getThreadHookName(message.type) === 'tk-threadsTypesMail'"
                :is="getThreadHookName(message.type)"
                :data="message"
                @email:response="emailReponse($event)"
            )
            component(
                v-else
                :is="getThreadHookName(message.type)"
                :data="message"
            )
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'nuxt/app';
import { useHttpApi } from '~/composables';
import { useDayjs, usePinia } from "#imports";
import type { Fragments, Threads, Thread } from '~/types';
import type { components } from '#build/types/service-api'
import { useQuasar } from 'quasar';
import { ThreadType } from '../../utils';
import { QScrollArea } from 'quasar';

type ThreadDto = components['schemas']['ThreadDto']

const dayjs = useDayjs()
const store = usePinia()
const route = useRoute()
const $q = useQuasar()
const user = store.state.value.auth.user

function getThreadHookName(type: ThreadType) {
    const baseUrl = 'tk-threadsTypes'
    switch (type) {
        case ThreadType.EXTERNAL:
        case ThreadType.INTERNAL:
        case ThreadType.OUTGOING:
            return `${baseUrl}Base`
        case ThreadType.INCOMING:
            return `${baseUrl}Mail`
        case ThreadType.SYSTEM:
            return `${baseUrl}System`
        default:
            return `${baseUrl}Base`
    }
}

const emit = defineEmits(['email:response'])
function emailReponse(data: ThreadDto) {
    emit('email:response', data)
}

const chatScroll = ref<InstanceType<typeof QScrollArea> | null>(null)
function scroll(): void {
    const target = chatScroll.value?.getScrollTarget()
    if (!target) return
    chatScroll.value?.setScrollPosition('vertical', target.scrollHeight, 0)
}

onMounted(() => {
    scroll()
})

async function threadsRefresh() {
    await refresh()
    scroll()
}

const baseQuery = ref({
    "filters[ticketId]": `${route.params.id}`,
    "sort[metadata.createdAt]": 'asc',
    "limit": 999,
})

const { data: threads, refresh, error } = await useHttpApi(`/tickets/thread`, {
    method: 'get',
    query: computed(() => {
        return {
            ...baseQuery.value,
            ...route.query
        }
    })
})

if (error.value) {
    $q.notify({
        message: 'Impossible de charger les messages',
        type: 'negative'
    })
}

const getMessageByDay = computed((): Threads | undefined => {
    return threads.value?.data.reduce((acc: Threads, thread: ThreadDto) => {
        const day = dayjs(thread.metadata.createdAt).format('DD-MM-YYYY')
        const newTread: Thread = {
            ...thread,
            fragments: getThreadFragments(thread)
        }
        if (!acc[day]) acc[day] = []
        acc[day].push(newTread)
        return acc
    }, {})
})

function getThreadFragments(thread: ThreadDto): Fragments {
    return thread.fragments.reduce((acc: Fragments, fragment) => {
        const disposition = fragment.disposition
        if (!acc[disposition]) acc[disposition] = []
        acc[disposition]?.push(fragment)
        return acc as Fragments
    }, {})
}

defineExpose({
    scroll,
    threadsRefresh,
})

</script>

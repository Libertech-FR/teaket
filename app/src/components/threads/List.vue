<template lang="pug">
q-scroll-area(ref="chatScroll")
    div(v-if="threads.total === 0").flex.items-center.justify-center
        span Aucun message
    div(v-for='(value, key) in getMessageByDay' :key='key')
        q-chat-message
            template(v-slot:label)
                span {{ key }}
                q-separator(inset)

        div(v-for="(message, index) in value" :id="message._id").q-mx-md
            //- div(v-for="fragment in message.fragments")
            q-chat-message(
                :sent="message.metadata.createdBy === user.username"
                :name="message.metadata.createdBy" size="10"
            )
                template(v-slot:stamp)
                    span {{ getTimeFrom(message.metadata.createdAt) }}
                        q-tooltip.text-body2 {{ getHour(message.metadata.createdAt) }}
                template(v-slot:default)
                    div
                        q-chip(v-for='attachment in message.attachments' :key='attachment._id' icon="mdi-paperclip" text-color="white" color="primary" dense size='md' :label="attachment.name")
                        q-separator.q-my-xs(v-if="message.fragments.file")
                        div(v-for='raw in message.fragments.raw' v-html="raw.message")
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'nuxt/app';
import { useHttpApi } from '~/composables';
import { useDayjs, usePinia } from "#imports";
import { generateMongoId } from '~/utils';
import type { Fragments, Threads } from '~/types';
import type { components } from '#build/types/service-api'
import { FsType } from '~/utils'
import { useQuasar } from 'quasar';

type ThreadDto = components['schemas']['ThreadDto']

const dayjs = useDayjs()
const store = usePinia()
const route = useRoute()
const $q = useQuasar()
const user = store.state.value.auth.user

onMounted(() => {
    scroll()
})
const chatScroll = ref(null)
const baseQuery = ref({
    "filters[ticketId]": `${route.params.id}`,
    "sort[metadata.createdAt]": 'asc',
    "limit": 999,
})
const { data: threads } = await useHttpApi(`tickets/thread`, {
    method: 'get',
    query: computed(() => {
        return {
            ...baseQuery.value,
            ...route.query
        }
    })
})

const getMessageByDay = computed((): Threads => {
    return threads.value?.data.reduce((acc: Threads, thread: ThreadDto) => {
        const day = dayjs(thread.metadata.createdAt).format('DD-MM-YYYY')
        const newTread = {
            ...thread,
            fragments: getThreadFragments(thread)
        }
        if (!acc[day]) acc[day] = []
        acc[day].push(newTread)
        return acc
    }, {})
})

const getThreadFragments = (thread: ThreadDto): Fragments => {
    return thread.fragments.reduce((acc: Fragments, fragment) => {
        const disposition = fragment.disposition
        if (!acc[disposition]) acc[disposition] = []
        acc[disposition]?.push(fragment)
        return acc as Fragments
    }, {})
}


const scroll = () => {
    const target = chatScroll.value?.getScrollTarget()
    chatScroll.value?.setScrollPosition('vertical', target.scrollHeight, 0)
}


const getTimeFrom = (time: string) => {
    return dayjs().to(dayjs(time))
}

const getHour = (time: string) => {
    return dayjs(time).format('DD-MM-YYYY HH:mm')
}


</script>
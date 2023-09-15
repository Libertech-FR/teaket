<template lang="pug">
q-card(style="height: 100%")
    q-toolbar
        q-toolbar-title {{ sequence }} | {{ subject }}
    q-card-section(style="height: auto")
        //- q-scroll-area(:style="{height: '100%'}")
        q-chat-message(v-for='(message, index) in thread.data' :key='message._id'
            :text="message.fragments.map(f => f.message)"
            :sent="index % 2 === 0"
        )

    q-card-section 
        q-editor(v-model="message" dense)
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'nuxt/app';
import { useHttpApi } from '~/composables/useHttpApi';

const props = defineProps({
    sequence: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    }
})

const route = useRoute()
const query = ref({
    "filters[ticketId]": `${route.params.id}`
})
const { data: thread } = await useHttpApi(`tickets/thread`, {
    method: 'get',
    query
})

const message = ref('')
</script>


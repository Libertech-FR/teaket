<template lang='pug'>
q-card.column.shadow-24(:style='{width: "250px"}')
  q-toolbar.bg-primary.text-white
    q-toolbar-title Connexion
  form(@submit.prevent='submit')
    q-card.no-shadow
      q-card-section.q-pt-sm.q-px-lg.q-pb-lg
        q-input(v-model="formData.username" label="Username" type="text")
        q-input(v-model="formData.password" label="Password" type="password" auto-complete='current-password')
      q-inner-loading(:showing='pending')
        q-spinner-grid(color='primary' size='50px')
    q-card-actions
      q-space
      q-btn(@click.prevent='submit' type='submit' color='primary') Se connecter
      q-space
</template>

<script lang="ts" setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'simple-centered',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})

const pending = ref(false)
const formData = ref({
  username: '',
  password: '',
})

const submit = async () => {
  pending.value = true
  await useAuth().loginWith('local', {
    body: formData.value,
  })
  pending.value = false
}
</script>

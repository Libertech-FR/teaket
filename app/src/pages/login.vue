<script lang="ts" setup>
import { ref } from 'vue'
import { definePageMeta, useAuth } from '#imports'
import { useMouse } from '@vueuse/core'
const { signIn, token, data, status, lastRefreshedAt } = useAuth()
const { x, y } = useMouse()

const username = ref('')
const password = ref('')
const refresh = () => {

}

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})
</script>

<template>
  <div>
    <h1>Login Page</h1>
    <pre>Mouse position: {{ x }}, {{ y }}</pre>
    <pre>Status: {{ status }}</pre>
    <pre>Data: {{ data || 'no session data present, are you logged in?' }}</pre>
    <pre>Last refreshed at: {{ lastRefreshedAt || 'no refresh happened' }}</pre>
    <pre>JWT token: {{ token || 'no token present, are you logged in?' }}</pre>
    <form @submit.prevent="signIn({ username, password })">
      <input v-model="username" type="text" placeholder="Username">
      <input v-model="password" type="password" placeholder="Password">
      <button type="submit">
        sign in
      </button>
      <button @click='refresh'>
        refresh
      </button>
    </form>
  </div>
</template>

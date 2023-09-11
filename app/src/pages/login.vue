<template>
  <div>
    <h1>Login Page</h1>
    <form @submit.prevent="submit">
      <input v-model="formData.username" type="text" placeholder="Username">
      <input v-model="formData.password" type="password" placeholder="Password">
      <button @click='submit'>
        sign in
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})

// const { signIn, token, data, status, lastRefreshedAt } = useAuth()

const formData = ref({
  username: '',
  password: '',
})

const submit = async () => {
  console.log("submitting", useAuth().getStrategy())
  await useAuth().loginWith('local', {
    body: formData.value,
  })
}
</script>

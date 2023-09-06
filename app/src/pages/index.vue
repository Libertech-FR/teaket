
<template lang='pug'>
div
  tk-hook(name="accueil" :data='{exemple: 1}' debug)
  span Accueil
  tk-hook(name="index.accueil.bottom")
  q-btn(@click='signIn()') signIn
  q-btn(@click='signOut()') signOut
</template>

<script lang='ts' setup>
import { definePageMeta, useAuth } from '#imports'
const { signIn, signOut, session, status, cookies, getProviders, user, sessionToken } = useAuth()

const test = useApiFetch('tickets/sla')
</script>

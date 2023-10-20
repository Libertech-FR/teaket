<template lang="pug">
div
  //q-btn(v-for="button in buttons" :key="button.icon" round flat :icon="button.icon" size="md").q-mx-sm
    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") {{ button.name }}
  q-btn-dropdown(icon="mdi-account-circle-outline" :label='auth.user.displayName' round flat size="md")
    q-list
      q-item.q-pa-none(v-for="button in buttons" :key="button.name")
        q-btn.full-width.items-baseline.q-pa-sm(
          :icon="button.icon"
          :label="button.name"
          :color="button?.color || 'primary'"
          @click="button?.action"
          :to='button?.to'
          flat
          dense
        )
</template>

<script lang="ts" setup>
const auth = useAuth()
const buttons = [
  // {
  //   icon: 'mdi-cog',
  //   name: 'Paramètres',
  //   to: '/settings',
  // },
  // {
  //   icon: 'mdi-bell',
  //   name: 'Notifications',
  //   to: '#',
  // },
  // {
  //   icon: 'mdi-help',
  //   name: 'Aide',
  //   to: '#',
  // },
  {
    icon: 'mdi-logout',
    name: 'Déconnexion',
    color: 'negative',
    action: async () => {
      await useAuth().logout()
      useRouter().go(0)
    },
  },
]
</script>

<template lang="pug">
q-btn(flat icon="mdi-dots-grid" size="20px" square)
    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Apps
    q-menu(max-height="280px" auto-close fit).q-pa-sm
        .row
            .col-4(v-for="(app, key) in apps" :key="key")
                q-btn(flat stack dense :to="app.to" stretch).full-width.q-pa-sm
                    q-icon(:name="app.icon.name" :color="app.icon.color" size="xl")
                    q-badge(v-if="app.badge" :color="app.badge.color" floating) {{ app.badge.value }}
                    div.text-center(:class="`text-${app.title.color}`") {{ app.title.name }}

</template>

<script lang="ts" setup>
import { usePinia, useQuasar } from '#imports'
const store = usePinia()
const $q = useQuasar()
const user = store.state.value.auth.user
const { data, error } = await useHttpApi('/tickets/ticket', {
  method: 'get',
  query: {
    'filters[@lifestep][]': 1,
    'filters[^envelope.assigned.name]': `/${user.displayName}/`,
  },
})
if (error.value) {
  $q.notify({
    message: 'Impossible de charger les tickets',
    type: 'negative',
  })
}
const baseFilter = 'sort[metadata.lastUpdatedAt]=desc&skip=0&limit=10'
const apps: {
  title: {
    name: string
    color: string
  }
  icon: {
    name: string
    color: string
  }
  badge?: { color: string; value: number | undefined }
  to: string
}[] = [
  {
    title: {
      name: 'Accueil',
      color: 'primary',
    },
    icon: {
      name: 'mdi-home',
      color: 'secondary',
    },
    to: '/',
  },
  {
    title: {
      name: 'Mes tickets',
      color: 'primary',
    },
    icon: {
      name: 'mdi-ticket',
      color: 'primary',
    },
    to: `/tickets?filters[^envelope.assigned.name]=/${user.displayName}/&filters[@lifestep][]=1&${baseFilter}`,
    badge: {
      color: 'red',
      value: data?.value?.total,
    },
  },
  {
    title: {
      name: 'Tickets',
      color: 'primary',
    },
    icon: {
      name: 'mdi-ticket',
      color: 'primary',
    },
    to: `/tickets?filters[@lifestep][]=1&${baseFilter}`,
  },
  {
    title: {
      name: 'Mails',
      color: 'secondary',
    },
    icon: {
      name: 'mdi-mail',
      color: 'primary',
    },
    to: `/mails`,
  },
  {
    title: {
      name: 'Clients',
      color: 'secondary',
    },
    icon: {
      name: 'mdi-card-account-details-outline',
      color: 'primary',
    },
    to: `/entities`,
  },
  {
    title: {
      name: 'Comptes',
      color: 'secondary',
    },
    icon: {
      name: 'mdi-account-group',
      color: 'primary',
    },
    to: `/identities`,
  },
  // {
  //     title: {
  //         name: 'Profil',
  //         color: 'primary'
  //     },
  //     icon: {
  //         name: 'mdi-account',
  //         color: 'primary'
  //     },
  //     to: '/profil'
  // },
  // {
  //     title: {
  //         name: 'Paramètres',
  //         color: 'primary'
  //     },
  //     icon: {
  //         name: 'mdi-cog',
  //         color: 'primary'
  //     },
  //     to: '/parametres'
  // },
]
</script>

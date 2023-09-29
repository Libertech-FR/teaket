<template lang="pug">
q-btn(flat icon="mdi-dots-grid" size="xl")
    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Apps
    q-menu(max-width="350px" max-height="350px").q-pa-md
        .row
            .col-4(v-for="app in apps" :key="app.name")
                q-btn(flat stack dense :to="app.to" rounded).full-width
                    q-icon(:name="app.icon.name" :color="app.icon.color" size="xl")
                    q-badge(v-if="app.badge" :color="app.badge.color" floating) {{ app.badge.value }}
                    div.text-center(:class="`text-${app.title.color}`") {{ app.title.name }}
                    
</template>

<script lang="ts" setup>
import { usePinia, useQuasar } from "#imports";
const store = usePinia()
const $q = useQuasar()
const user = store.state.value.auth.user
const { data, error } = await useHttpApi('/tickets/ticket', {
    method: 'get',
    query: {
        'filters[@lifestep][]': 1,
        'filters[^envelope.assigned.name]': `/${user.displayName}/`,
    }
})
if (error.value) {
    $q.notify({
        message: 'Impossible de charger les tickets',
        type: 'negative'
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
    to: string
}[] = [
        {
            title: {
                name: 'Accueil',
                color: 'primary'
            },
            icon: {
                name: 'mdi-home',
                color: 'secondary'
            },
            to: '/'
        },
        {
            title: {
                name: 'Mes tickets',
                color: 'primary'
            },
            icon: {
                name: 'mdi-ticket',
                color: 'primary'
            },
            to: `/tickets?filters[^envelope.assigned.name]=/${user.displayName}/&filters[@lifestep][]=1&${baseFilter}`,
            badge: {
                color: 'red',
                value: data.value.total
            }
        },
        {
            title: {
                name: 'Tickets',
                color: 'primary'
            },
            icon: {
                name: 'mdi-ticket',
                color: 'primary'
            },
            to: `/tickets?filters[@lifestep][]=1&${baseFilter}`
        },
        {
            title: {
                name: 'Profil',
                color: 'primary'
            },
            icon: {
                name: 'mdi-account',
                color: 'primary'
            },
            to: '/profil'
        },
        {
            title: {
                name: 'Paramètres',
                color: 'primary'
            },
            icon: {
                name: 'mdi-cog',
                color: 'primary'
            },
            to: '/parametres'
        },
        {
            title: {
                name: 'Déconnexion',
                color: 'negative'
            },
            icon: {
                name: 'mdi-logout',
                color: 'negative'
            },
            to: '/deconnexion'
        }
    ]


</script>
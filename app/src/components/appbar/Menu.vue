<template lang="pug">
q-btn(flat icon="mdi-dots-grid" size="xl")
    q-tooltip.text-body2(transition-show="scale" transition-hide="scale") Apps
    q-menu(max-width="350px" max-height="350px").q-pa-md
        .row
            .col-4(v-for="app in apps" :key="app.name")
                q-btn(flat stack dense :to="app.to" rounded).full-width
                    q-icon(:name="app.icon.name" :color="app.icon.color" size="xl")
                    div.text-center(:class="`text-${app.title.color}`") {{ app.title.name }}
</template>

<script lang="ts" setup>
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
            to: '/tickets'
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
            to: '/tickets'
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
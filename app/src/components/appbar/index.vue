<template lang="pug">
q-header
    q-toolbar.bg-primary.text-white(style={height: '32px'})
        q-btn(flat)
            q-avatar
                img(src="/logo.svg")
            q-toolbar-title Teaket
        q-separator(vertical dark inset).q-mx-md
        tk-AppbarMenu
        q-space
        //tk-AppbarSearchfield
        //q-separator(vertical dark inset).q-mx-md
        tk-AppbarRightButtons
</template>

<script lang="ts" setup></script>

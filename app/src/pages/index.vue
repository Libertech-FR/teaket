
<template lang='pug'>
div
  tk-hook(name="accueil" :data='{exemple: 1}' debug)
  span Accueil
  tk-hook(name="index.accueil.bottom")
  q-btn(@click='logout') signOut
</template>

<script lang='ts' setup>
const logout = () => {
  useAuth().logout()
}
</script>

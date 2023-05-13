<script setup lang="ts">
import Headers from '@/components/header/headers.vue';
import Home from '@/layouts/home'
const subTitle = [
  { tilte: 'Blog', link: '/blog' }
]
</script>

<template>
  <Headers>
    <template #right-icon>
      <template v-for="titles in subTitle">
        <a class="links" :href="titles.link">{{ titles.tilte }}</a>
      </template>
    </template>
  </Headers>
  <Home />
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


body,
html,
#app {
  width: 100%;
  height: 100%;
}

.links {
  transition: all 0.3s;
}

a {
  text-decoration: none;
  color: inherit;

  &:visited {
    color: inherit;
  }
}
</style>
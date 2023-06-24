<script setup lang="ts">
import Headers from '@/components/header/headers.vue'
import Home from '@/layouts/home'
import { LogoIcon } from '@/icons/index'
import { useRouter } from 'vue-router'

const router = useRouter()

const subTitle = [
  { title: 'Blog', link: '/blog' },
  { title: 'Projects', link: '/project' },
]

const toRoute = (link: string) => {
  router.push(link)
}
</script>

<template>
  <Headers>
    <template #left>
      <LogoIcon />
    </template>
    <template #right-icon>
      <template v-for="titles in subTitle">
        <a class="links" @click="toRoute(titles.link)">{{ titles.title }}</a>
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
  cursor: pointer;

  &:visited {
    color: inherit;
  }
}
</style>

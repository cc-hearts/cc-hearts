<script setup lang="ts">
import Headers from '@/components/header/headers.vue'
import Home from '@/layouts/home'
import { Logo } from '@/icons/index'
import { useRouter } from 'vue-router'
import { subTitle } from '@/configs'
import Plum from '@/components/plum/index.vue'

const router = useRouter()

const toRoute = (link: string, isToLink = false) => {
  if (isToLink) {
    window.open(link)
    return
  }
  router.push(link)
}
</script>

<template>
  <Plum />
  <Headers>
    <template #left>
      <Logo />
    </template>
    <template #right-icon>
      <template v-for="titles in subTitle">
        <a class="links" @click="toRoute(titles.link, titles.isToLink)">{{
          titles.title
        }}</a>
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
  margin: 0;
  padding: 0;
}

.links {
  transition: all 0.3s;
}

#app {
  display: flex;
  flex-direction: column;
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

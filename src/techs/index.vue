<script setup lang="ts">
import { capitalize } from '@cc-heart/utils'
import { useRouter } from 'vue-router'

// TODO: auto generator
const config = [
  { text: 'base', link: '/techs/base/index' },
  { text: 'javascript', link: '/techs/javascript/index' },
].map((target) => ({ ...target, text: capitalize(target.text) }))

const router = useRouter()
const toLink = (path: string) => router.push(path)
</script>

<template>
  <div class="flex justify-between gap-3%">
    <div
      class="w-33% p-8 tech-card"
      v-for="item in config"
      :key="item.text"
      @click="toLink(item.link)"
    >
      <span>{{ item.text }}</span>
    </div>
  </div>
</template>
<style lang="scss">
.tech-card {
  border-radius: 8px;
  background-color: var(--tech-background-color);
  transition: all 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
}
</style>

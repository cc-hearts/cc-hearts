<script setup lang="ts">
import { capitalize } from '@cc-heart/utils'
import { useRouter } from 'vue-router'
import TechsDirOptions from '@/configs/techs-auto-config'

const config = TechsDirOptions.map((target) => ({
  ...target,
  text: capitalize(target.text),
}))

const router = useRouter()
const toLink = (path: string) => router.push(path)
</script>

<template>
  <div class="flex flex-wrap justify-between gap-2%">
    <div
      class="w-32% p-8 tech-card m-b-2%"
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

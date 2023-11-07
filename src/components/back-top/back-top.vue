<script setup lang="ts">
import { useCssNamespace } from '@/hooks'
import BackTopIcon from '@/icons/back-top-icon.vue'
import { useDebounce } from '@cc-heart/utils'
import { onMounted, onUnmounted, ref } from 'vue'
const ns = useCssNamespace('back-top')

const isShowBackTop = ref(true)

const threshold = 64

const backTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth', // 可选项，实现平滑滚动效果
  })
}

const onScroll = () => {
  isShowBackTop.value = document.documentElement.scrollTop < threshold
}

const listenerScroll = useDebounce(onScroll, 100)

onMounted(() => {
  window.addEventListener('scroll', listenerScroll, false)
})

onUnmounted(() => {
  window.removeEventListener('scroll', listenerScroll, false)
})
</script>
<template>
  <div
    class="flex p-3 rounded-full"
    :class="[ns.cls, isShowBackTop ? ns.e('show') : '']"
    @click="backTop"
  >
    <BackTopIcon />
  </div>
</template>
<style lang="scss">
@use '@/assets/scss/var/variable.scss' as *;

.#{$namespace}-back-top {
  --back-top-background: #fff;
  cursor: pointer;
  box-sizing: border-box;
  position: fixed;
  bottom: 3rem;
  right: 15vw;
  background: var(--back-top-background);
  box-shadow: 0 0 12px var(--shadow-1);
  transition: all 0.18s;
  opacity: 0.6;
  pointer-events: all;
  &:hover {
    box-shadow: 0 0 16px var(--shadow-1-active);
  }

  &__show {
    opacity: 0;
    pointer-events: none;
  }
}

.dark {
  .#{$namespace}-back-top {
    --back-top-background: rgb(72, 72, 77);
  }
}
</style>

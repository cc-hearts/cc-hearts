<script setup lang="ts">
import { useCssNamespace } from '@/hooks'
import { Github } from '@/icons'
import SwitchTheme from '@/components/switch/switch-theme.vue'
const cssNs = useCssNamespace('header')
</script>

<template>
  <header
    class="flex justify-between items-center px-10 flex-shrink-0"
    :class="[cssNs.cls]"
  >
    <slot name="left">
      <div></div>
    </slot>
    <div class="flex items-center" :class="[cssNs.e('icon')]">
      <slot name="right-icon"></slot>
      <Github />
      <SwitchTheme />
    </div>
  </header>
</template>

<style lang="scss">
@use '@/assets/scss/var/variable.scss' as var;

.#{var.$namespace}-header {
  height: 60px;

  &__icon {
    color: var(--color-text-3);

    & > div,
    & > button,
    & > svg,
    & > a {
      margin: 0 0.7rem;

      transition: color 0.3s;

      &:hover {
        color: var(--color-text-1);
      }
    }

    svg {
      cursor: pointer;
      font-size: 24px;
    }
  }
}

.dark .#{var.$namespace}-header {
  --header-shadow: rgb(72, 72, 73);
}
</style>

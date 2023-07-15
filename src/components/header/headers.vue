<script setup lang="ts">
import { usePrefixCls } from '@/hooks'
import { GithubIcon } from '@/icons'
import ToggleDark from '@/components/switch/toggleDark.vue'
const headerCls = usePrefixCls('header')
</script>

<template>
  <header
    class="flex justify-between items-center px-10 flex-shrink-0"
    :class="[headerCls]"
  >
    <slot name="left">
      <div></div>
    </slot>
    <div class="flex items-center" :class="[`${headerCls}__icon`]">
      <slot name="right-icon"></slot>
      <GithubIcon />
      <ToggleDark />
    </div>
  </header>
</template>

<style lang="scss">
@use '@/assets/scss/var/variable.scss' as var;

.#{var.$prefixCls}-header {
  // --header-shadow: rgb(229, 230, 235);
  height: 60px;
  // box-shadow: 0 1px 0 var(--header-shadow);

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

.dark .#{var.$prefixCls}-header {
  --header-shadow: rgb(72, 72, 73);
}
</style>

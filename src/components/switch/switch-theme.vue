<script setup lang="ts">
import { THEME } from '@/configs'
import { useCssNamespace, useTheme, useToggleTheme } from '@/hooks'
import { Moon, Sun } from '@/icons'
import { computed } from 'vue'

const cssNs = useCssNamespace('appearance')
const [theme] = useTheme()

function handleToggleTheme() {
  useToggleTheme()
}
const checked = computed(() => {
  return theme.value === THEME.DARK
})
</script>

<template>
  <div class="flex" :class="[cssNs.cls]">
    <button
      role="switch"
      aria-label="toggle theme"
      class="relative block shrink-0 outline-0"
      :aria-checked="checked"
      @click="handleToggleTheme"
    >
      <span :class="[cssNs.e('check')]">
        <span
          class="relative block overflow-hidden rounded-full"
          :class="[cssNs.e('icon')]"
        >
          <Sun />
          <Moon />
        </span>
      </span>
    </button>
  </div>
</template>

<style lang="scss">
@use '@/assets/scss/var/variable.scss' as *;
@use '@/assets/scss/common/mixins.scss' as *;
@use '@/assets/scss/common/function.scss' as *;

.dark {
  @include b('appearance') {
    --switch-border-divider: #545454a6;
    --switch-bg-color: #3b3b3b;
    --switch-checked-color: #1a1a1a;
    --switch-fill-svg: #ffffffde;
  }
}

@include b('appearance') {
  --switch-border-divider: #3c3c3c4a;
  --switch-bg-color: #f1f1f1;
  --switch-checked-color: #fff;
  --switch-fill-svg: #3c3c3cb3;
  --switch-translate-x: 18px;

  button {
    border-radius: 11px;
    width: 40px;
    height: 22px;
    cursor: pointer;
    border: 1px solid var(--switch-border-divider);
    background-color: var(--switch-bg-color);
    transition: border-color 0.25s;

    &[aria-checked='true'] {
      $is-at-root: false !global;

      @include e('check') {
        transform: translate(var(--switch-translate-x));
      }

      $is-at-root: true !global;

      .sun {
        opacity: 0;
      }

      .moon {
        opacity: 1;
      }
    }
  }

  @include e('icon') {
    width: 18px;
    height: 18px;

    svg {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 12px;
      height: 12px;
      fill: var(--switch-fill-svg);
    }
  }

  @include e('check') {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: var(--switch-checked-color);
    transition: transform 0.25s;
  }
}

.sun {
  opacity: 1;
}

.moon {
  opacity: 0;
}
</style>

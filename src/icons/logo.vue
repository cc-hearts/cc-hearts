<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const toHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="relative">
    <svg
      class="logo"
      @click="toHome"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="path"
        d="M5 21.7693C11.8669 28.4181 50.7271 9.05878 38.7101 1.43222C26.2334 -4.23772 6.59434 47.7641 22.0111 46.9915C37.4279 46.2188 44.5197 21.2813 36.6812 18.9906C28.8428 16.6999 22.0111 29.0543 22.6354 36.7316C23.2596 44.4089 33.5446 34.064 31.6872 30.1055"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      ></path>
    </svg>
  </div>
</template>

<style lang="scss">
.logo {
  position: fixed;
  top: 6px;
  left: 3rem;
  width: 48px;
  height: 48px;
  stroke-dashoffset: 1px;
  stroke-dasharray: 250px 0;
  cursor: pointer;
  animation: logo-animation 6s ease forwards infinite;
  transform-origin: center;
}

@media (prefers-reduced-motion) {
  path {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}

@keyframes logo-animation {
  0% {
    stroke-dasharray: 0 250px;
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  40% {
    stroke-dasharray: 250px 0;
  }

  65% {
    stroke-dasharray: 250px 0;
  }

  85%,
  to {
    stroke-dasharray: 0 250px;
  }
}
</style>

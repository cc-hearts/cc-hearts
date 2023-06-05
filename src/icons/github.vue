<template>
  <svg
    @click="toGithub"
    xmlns="http://www.w3.org/2000/svg"
    width="0.8em"
    height="0.8em"
    viewBox="0 0 24 24"
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path
        d="M16 22.027v-2.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7a5.44 5.44 0 0 0-1.5-3.75a5.07 5.07 0 0 0-.09-3.77s-1.18-.35-3.91 1.48a13.38 13.38 0 0 0-7 0c-2.73-1.83-3.91-1.48-3.91-1.48A5.07 5.07 0 0 0 5 5.797a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.58v2.87"
      ></path>
      <path d="M9 20.027c-3 .973-5.5 0-7-3"></path>
    </g>
  </svg>
</template>

<script lang="ts">
export default {
  name: 'IconoirGithub',
  setup() {
    function toGithub() {
      window.open('https://github.com/cc-hearts')
    }
    return { toGithub }
  },
}
</script>

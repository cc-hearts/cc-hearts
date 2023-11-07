<template>
  <slot />
</template>

<script setup>
import { useScriptTag } from '@/hooks/use-script-tag'
import { onMounted, ref } from 'vue'
const twitter = ref(null)
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
})
onMounted(() => {
  useScriptTag(props.src, twitter.value)
})
</script>

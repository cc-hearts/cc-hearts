<script setup lang="ts">
const config = [{ text: 'base', link: '/base/index' }]
</script>
<template>
  <div class="flex">
    <div v-for="item in config" :key="item.text">
      <router-link :to="item.link">{{ item.text }}</router-link>
    </div>
  </div>
</template>
<style lang="scss"></style>

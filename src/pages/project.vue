<script setup lang="ts">
import { markRaw } from 'vue'
import { projects } from '@/configs'
import type { getArrayChildItem } from '@cc-heart/utils/helper'

const toLink = (project: getArrayChildItem<typeof projects>) =>
  window.open(project.link)
</script>

<template>
  <div class="grid gap-4 cc-heart-projects">
    <div
      v-for="project in projects"
      :key="project.title"
      class="flex gap-2"
      @click="toLink(project)"
    >
      <template v-if="project.icon">
        <component :is="markRaw(project.icon)" />
      </template>
      <div>
        <h3>
          {{ project.title }}
        </h3>
        <p>{{ project.description }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@mixin project-transition {
  transition: all 0.28s;
  will-change: color;
}

.cc-heart-projects {
  color: var(--color-text-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));

  p {
    text-align: left;
    margin: 8px 0;
  }

  svg {
    box-sizing: content-box;
    font-size: 50px;
    padding: 12px 12px 0 0;
    align-self: center;
  }

  & > div {
    @include project-transition();
    padding: 8px;

    h3,
    p {
      @include project-transition();
    }

    &:hover {
      cursor: pointer;
      background-color: var(--project-bgc);

      h3,
      p {
        color: var(--color-text-2);
      }
    }

    & > div {
      flex: 1;
    }
  }
}

@media screen and (max-width: 768px) {
  .cc-heart-projects {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (max-width: 480px) {
  .cc-heart-projects {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>

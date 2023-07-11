<script setup lang="ts">
import { markRaw } from 'vue'
import {
  ExportIcon,
  VueStarterIcon,
  ImageUploadIcon,
  NestStarterIcon,
  ObjectToDeclareIcon,
  IconFontIcon,
} from '@/icons'
import type { getArraySubitem } from '@cc-heart/utils/helper'
const projects = [
  {
    title: 'rename export',
    link: 'https://github.com/cc-hearts/rename-export.git',
    description: 'Generate code to rename exports',
    icon: ExportIcon,
  },
  {
    title: 'vue3 starter',
    link: 'https://github.com/cc-hearts/vue3-starter.git',
    description: 'A basic template for vue3',
    icon: VueStarterIcon,
  },
  {
    title: 'nest pic',
    link: 'https://github.com/cc-hearts/nest-pic.git',
    description: 'nest implemented the graph bed service',
    icon: ImageUploadIcon,
  },
  {
    title: 'object to declare',
    link: 'https://github.com/cc-hearts/object-to-declare.git',
    description:
      'A library of tools for converting objects into type declarations',
    icon: ObjectToDeclareIcon,
  },
  {
    title: 'icon class generate',
    link: 'https://github.com/cc-hearts/iconfont-class-generate.git',
    description: 'extract the icon name from the iconfont',
    icon: IconFontIcon,
  },
  {
    title: 'nest starter',
    link: 'https://github.com/cc-hearts/nest-starter',
    description:
      'nest templates support the basics of databases, swagger, and more',
    icon: NestStarterIcon,
  },
]

const toLink = (project: getArraySubitem<typeof projects>) =>
  window.open(project.link)
</script>

<template>
  <div class="grid grid-cols-2 gap-4 cc-heart-projects">
    <div
      v-for="project in projects"
      :key="project.title"
      class="flex"
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
</style>

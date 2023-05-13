<script setup lang="ts">
import { IFrontmatter } from '@/types/types';
import { useRouter } from 'vue-router';

const router = useRouter().getRoutes().filter(router => router.meta?.frontmatter)
const posts = Object.create(null)
router.forEach(route => {
  const frontmatter = route.meta.frontmatter as IFrontmatter
  const time = frontmatter.time || new Date()
  const year = new Date(time).getFullYear()
  const postList = Reflect.get(posts, year)
  const config = { title: frontmatter.title, path: route.path }
  if (!postList)
    Reflect.set(posts, year, [config])
  else
    Reflect.set(posts, year, [...postList, config])
})
</script>

<template>
  <div class="cc-blog">
    <template v-for="year in Object.keys(posts)">
      <span class="year">{{ year }}</span>
      <div class="post-list">
        <template v-for="post in posts[year]">
          <a class="post-title text-lg leading-1.2em my-2 inline-block " :href="post.path"> {{ post.title
          }}</a>
        </template>
      </div>
    </template>

  </div>
</template>

<style lang="scss">
.cc-blog {
  color: var(--color-text-3);

  .post-title {
    transition: color 0.3s;

    &:hover {
      color: var(--color-text-1);
    }
  }
}

.year {
  display: inline-block;
  font-size: 8em;
  color: transparent;
  font-weight: 700;
  -webkit-text-stroke-color: rgba(170, 160, 160, 1.0);
  -webkit-text-stroke-width: 2px;
  opacity: 0.2;
  transform: translate(-60px);
}

.post-list {
  transform: translateY(-5.5em);
}
</style>
<script setup lang="ts">
import { DraftIcon, New } from '@/icons'
import type { IFrontmatter, IPosts } from '@/types/types'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const routes = router
  .getRoutes()
  .filter((router) => router.meta?.frontmatter)
  .filter((router) => !(router.meta.frontmatter as IFrontmatter)?._meta?.hidden)

const posts = Object.create(null)
routes.forEach((route) => {
  const frontmatter = route.meta.frontmatter as IFrontmatter
  let time = frontmatter.time || new Date()
  time = new Date(time)
  const year = time.getFullYear()
  const month = time.toDateString().split(' ')[1]
  const date = time.getDate()
  const draft = frontmatter.isDraft
  const postList = Reflect.get(posts, year)
  const config: IPosts = {
    title: frontmatter.title,
    path: route.path,
    month,
    draft,
    date,
    time,
  }
  if (!postList) Reflect.set(posts, year, [config])
  else Reflect.set(posts, year, [...postList, config])
})
Object.keys(posts).forEach((key) => {
  const array = posts[key]
  array.sort((a: IPosts, b: IPosts) => b.time.getTime() - a.time.getTime())
})

const toRoute = (link: string) => {
  router.push(link)
}

const isShowNewTag = (date: Date) => {
  return Date.now() - +date <= 1000 * 60 * 60 * 48
}

const years = computed(() =>
  Object.keys(posts).sort((a: string, b: string) => Number(b) - Number(a))
)
</script>

<template>
  <div class="cc-blog">
    <template v-for="year in years">
      <span class="year">{{ year }}</span>
      <div class="post-list">
        <template v-for="post in posts[year]">
          <a
            class="post-title text-lg leading-1.2em my-2 inline-block relative"
            @click="toRoute(post.path)"
          >
            <DraftIcon
              v-if="post.draft"
              class="m-r-2 absolute left--4 translate-y50%"
            />
            <span>
              {{ post.title }}
            </span>
            <span class="mx-2"> {{ post.month }} {{ post.date }} </span>
            <New
              v-if="isShowNewTag(post.time)"
              class="text-3xl top--50% leading-none absolute"
            />
          </a>
        </template>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.cc-blog {
  color: var(--color-text-3);

  .post-title {
    display: block;
    transition: color 0.3s;

    &:hover {
      color: var(--color-text-1);
    }
  }
}

.year {
  font-family: 'PingFang SC';
  display: inline-block;
  font-size: 8em;
  color: transparent;
  font-weight: 700;
  -webkit-text-stroke-color: rgba(170, 160, 160, 1);
  -webkit-text-stroke-width: 2px;
  opacity: 0.2;
  transform: translate(-60px);
  user-select: none;
}

.post-list {
  transform: translateY(-5.5em);
}
</style>

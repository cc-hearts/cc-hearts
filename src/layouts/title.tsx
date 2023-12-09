import '@/assets/pages/title.scss'
import { Text, Time } from '@/icons'
import { IFrontmatter, IReadTIme, Slug } from '@/types/types'
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'Title',
  setup() {
    const flag = ref(false)
    const route = useRoute()
    const title = computed(
      () =>
        (route.meta.slug as Array<Slug>)?.find((target) => target.lvl === 1)
          ?.content
    )
    watch(
      () => (route.meta?.frontmatter as IFrontmatter)?.articleId,
      (val) => {
        flag.value = !!val
      },
      { immediate: true }
    )
    const frontmatter = computed(() => route?.meta?.frontmatter as IFrontmatter)
    const readTime = computed(() => route?.meta?.readTime as IReadTIme)

    const isHomePage = computed(
      () => (route?.meta?.frontmatter as IFrontmatter)?.home
    )

    function genChildrenEl() {
      if (isHomePage.value) {
        return null
      }
      return (
        <div class="cc-info-box">
          <span class="m-r-3">{frontmatter.value?.time?.split('T')[0]}</span>
          <span class="m-r-3">
            <span class="align-middle	m-r-0.5">
              <Time />
            </span>
            阅读 {readTime.value?.minutes} 分钟
          </span>
          <span class="m-r-3">
            <span class="align-middle mr-0.5">
              <Text />
            </span>
            {readTime.value?.words}字
          </span>
        </div>
      )
    }
    return () => {
      if (!flag.value) return null
      return (
        <div class="m-b-8">
          <h1>{title.value}</h1>
          {genChildrenEl()}
        </div>
      )
    }
  },
})

import { IFrontmatter, IReadTIme } from '@/types/types'
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import '@/assets/pages/title.scss'
import { TextIcon, TimeIcon } from '@/icons'
export default defineComponent({
  name: 'Title',
  setup() {
    const flag = ref(false)
    const route = useRoute()
    const title = computed(
      () => (route?.meta?.frontmatter as IFrontmatter)?.title
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
    return () =>
      (flag.value && (
        <div class="m-b-8">
          <h1>{title.value}</h1>
          <div class="cc-info-box">
            <span class="m-r-3">{frontmatter.value?.time?.split('T')[0]}</span>
            <span class="m-r-3">
              <span class="align-middle	m-r-0.5">
                <TimeIcon />
              </span>
              阅读 {readTime.value?.minutes} 分钟
            </span>
            <span class="m-r-3">
              <span class="align-middle mr-0.5">
                <TextIcon />
              </span>
              {readTime.value?.words}字
            </span>
          </div>
        </div>
      )) ||
      null
  },
})

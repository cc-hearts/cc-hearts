import type { Slug } from '@/types/types'
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'SideNav',
  setup() {
    const route = useRoute()
    const title = computed(
      () =>
        (route.meta.slug as Array<Slug>)?.find((target) => target.lvl === 1)
          ?.content || ''
    )
    const activeCls = ref('')
    const activeIndex = ref(0)
    const threshold = 15
    const heightObserverList: { attrId: string; height: number }[] = []
    const sideRef = computed(
      () =>
        ((route.meta.slug as Array<Slug>)?.filter(
          (target) => target.lvl !== 1
        ) as Array<Slug>) || []
    )
    const calcTocHeight = () => {
      heightObserverList.length = 0
      sideRef.value.forEach((side) => {
        const el = document.getElementById(side.attrId)
        if (el) {
          const height = el.getBoundingClientRect().top + window.scrollY
          const attrId = el.getAttribute('id') || ''
          heightObserverList.push({ attrId, height })
        }
      })
    }

    const calcActiveCls = () => {
      const scrollY = window.scrollY
      for (let i = 0; i < heightObserverList.length; i++) {
        const height = heightObserverList[i].height - threshold
        if (
          (i === 0 && scrollY <= height) ||
          (i === heightObserverList.length - 1 && scrollY >= height)
        ) {
          activeCls.value = heightObserverList[i].attrId
          activeIndex.value = i
          return
        }

        if (height > scrollY) {
          activeCls.value = heightObserverList[i - 1]?.attrId
          activeIndex.value = i - 1
          return
        }
      }
    }

    const addEventListener = () => {
      window.addEventListener('scroll', calcActiveCls)
    }

    watch(
      () => route.meta.slug,
      () => {
        calcTocHeight()
      }
    )
    onMounted(() => {
      calcTocHeight()
      addEventListener()
      calcActiveCls()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', calcActiveCls)
    })
    return () => (
      <nav class={'absolute h-100vh cc-nav max-w-64'}>
        <ul class={'relative h-full overflow-auto no-show-scrollbar'}>
          <li class="outline-title">{title.value}</li>
          {sideRef.value.map((item) => (
            <li
              class={`cursor-pointer  ${
                item.attrId === activeCls.value ? 'activeNav' : ''
              }`}
              style={{ paddingLeft: `${item.lvl * 10}px` }}
            >
              <a
                class={`block whitespace-nowrap overflow-hidden text-ellipsis`}
                href={`#${item.attrId}`}
                title={item.content}
              >
                {item.content}
              </a>
            </li>
          ))}

          {sideRef.value.length > 0 && (
            <span
              class="absolute w-2px rounded outline-marker"
              style={{ '--transform-top': activeIndex.value + 1 }}
            ></span>
          )}
        </ul>
      </nav>
    )
  },
})

import {
  watch,
  defineComponent,
  computed,
  onMounted,
  ref,
  onUnmounted,
} from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'SideNav',
  setup() {
    const route = useRoute()
    const sideRef = computed(
      () => (route.meta.slug as Array<{ name: string; attrId: string }>) || []
    )


    const activeCls = ref('')
    const threshold = 15
    const heightObserverList: { attrId: string; height: number }[] = []
    const calcTocHeight = () => {
      heightObserverList.length = 0
      console.log('sideRef.value',sideRef.value);
      sideRef.value.forEach((side) => {
        const el = document.getElementById(side.attrId)
        if (el) {
          const height = el.getBoundingClientRect()?.top
          const attrId = el.getAttribute('id') || ''
          heightObserverList.push({ attrId, height })
        }
      })
    }

    const calcActiveCls = () => {
      const scrollY = window.scrollY
      for (let i = 0; i < heightObserverList.length; i++) {
        const height = heightObserverList[i].height - threshold
        console.log(heightObserverList);
        if (i === 0 && scrollY <= height) {
          activeCls.value = heightObserverList[i].attrId
          return
        }
        if (i === heightObserverList.length - 1 && scrollY >= height) {
          activeCls.value = heightObserverList[i].attrId
          return
        }

        if (height > scrollY) {
          activeCls.value = heightObserverList[i - 1]?.attrId
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
      <nav class={'absolute top-24 right-25 cc-nav'}>
        <ul>
          {sideRef.value.map((item) => (
            <li
              class={`cursor-pointer ${
                item.attrId === activeCls.value ? 'activeNav' : ''
              }`}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
    )
  },
})

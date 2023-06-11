import { defineComponent, onMounted, ref } from "vue"
import Typed from 'typed.js'
export default defineComponent({
  setup() {
    const el = ref(null)
    onMounted(() => {
      new Typed(el.value, {
        strings: [
          'I’m currently learning <code>Javascript</code>',
          'I’m currently learning <code>Rust</code>',
          'I’m currently learning <code>Nest</code>',
        ],
        typeSpeed: 40,
      })
    })
    return () => <div>
      <p>
        🌱 <span ref={el}></span>
      </p>
    </div>
  }
})
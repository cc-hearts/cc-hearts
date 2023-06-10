import { defineComponent, onMounted, ref } from "vue"
import Typed from 'typed.js'

export default defineComponent({
  setup() {
    const el = ref(null)
    onMounted(() => {
      new Typed(el.value,{
        strings: ['I’m currently learning <code>Rust</code>', 'I’m currently learning <code>Vite</code>'],
        typeSpeed: 40,
      })
    })
    return () => <p>
      🌱 <span ref={el}></span>
    </p>
  }
})
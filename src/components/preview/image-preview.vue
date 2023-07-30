<script setup lang="ts">
import { onMounted, reactive, ref, onUnmounted } from 'vue'
import { isNull, isUndef } from '@cc-heart/utils'

let node: HTMLImageElement | null = null
let originNode: HTMLImageElement | null = null
const maskRef = ref(null)
const state = reactive({
  preview: false,
  src: null as string | null,
  attr: {
    position: null,
    left: null,
    top: null,
    zIndex: null,
    opacity: null,
  },
})
let windowWidth: number | undefined
let windowHeight: number | undefined

function isImage(el: Element) {
  return el.tagName === 'IMG'
}

function resizeWindowRect() {
  if (node) cancel()
  windowWidth = window.innerWidth
  windowHeight = window.innerHeight
}

function addEventListener(node: MouseEvent) {
  if (!node.target) return
  const el = node.target as HTMLImageElement
  if (isImage(el) && !isCloneImageNode(el) && !state.preview) {
    // 开启预览模式
    state.preview = true
    state.src = el.getAttribute('src') || null
    copyAttr(el)
    cloneImageNode(el)
  }
}
onMounted(() => {
  resizeWindowRect()
  window.addEventListener('click', addEventListener)
  window.addEventListener('resize', resizeWindowRect)
})

onUnmounted(() => {
  window.removeEventListener('click', addEventListener)
  window.removeEventListener('resize', resizeWindowRect)
})

function calcNodeRect(el: HTMLImageElement) {
  const rect = el.getBoundingClientRect()
  const { width } = rect
  const left = el.offsetLeft - window.scrollX
  const top = el.offsetTop - window.scrollY
  return { width, left, top }
}

function calcPreviewImageTransform({
  top,
  left,
}: {
  top: number
  left: number
}) {
  if (!windowWidth || !windowHeight || !node) return {}
  const scale = Math.min(
    windowWidth / node.offsetWidth,
    windowHeight / node.offsetHeight
  ).toFixed(4)
  const height = windowHeight / 2 - node.offsetHeight / 2 - top
  const width = windowWidth / 2 - node.offsetWidth / 2 - left
  return { scale, height, width }
}

function parsePrefix2Number(prefix: string) {
  return Number(prefix.replace('px', '')) || 0
}

// calc preview image cancel rect
function calcPreviewImageCancelRect(
  node: HTMLImageElement,
  originNode: HTMLImageElement
) {
  const { left: originLeft, top: originTop } = calcNodeRect(originNode)
  const left = parsePrefix2Number(node.style.left)
  const top = parsePrefix2Number(node.style.top)
  return {
    left: originLeft - left,
    top: originTop - top,
  }
}

function genPreviewImageNode(
  el: Element,
  { width, left, top }: { width: number; left: number; top: number }
) {
  const node = el.cloneNode(true) as HTMLImageElement
  node.removeAttribute('id')
  node.classList.add('preview-image')
  node.setAttribute('width', width + 'px')
  node.setAttribute('preview-image', '')
  node.style.position = 'fixed'
  node.style.left = `${left}px`
  node.style.top = `${top}px`
  node.style.zIndex = '1001'
  return node
}

function cloneImageNode(el: Element) {
  originNode = el as HTMLImageElement
  const { width, left, top } = calcNodeRect(originNode)
  node = genPreviewImageNode(el, { width, left, top })
  document.body.appendChild(node)
  node.onload = () => {
    if (!node || !originNode) return
    const { scale, height, width } = calcPreviewImageTransform({ left, top })
    node.style.transform = `translate3d(${width}px, ${height}px, 0) scale(${scale})`
    showMask()
    originNode.style.opacity = '0'
  }

  node?.addEventListener('click', cancel)
  node?.addEventListener('transitionend', transitionend)
}

function cancel(e?: Event) {
  Object.keys(state.attr).forEach((key) => {
    const attr = Reflect.get(state.attr, key)
    !isNull(attr) && !isUndef(attr) && node && node.setAttribute(key, attr)
  })
  if (node && originNode) {
    const { left, top } = calcPreviewImageCancelRect(node, originNode)
    node.style.transform = `scale(1) translate3d(${left}px, ${top}px, 0)`
  }

  state.preview = false
  hideMask()
  // 阻止冒泡
  e && e.stopPropagation()
}

function copyAttr(el: Element) {
  Object.keys(state.attr).forEach((key) => {
    Reflect.set(state.attr, key, el.getAttribute(key))
  })
}

function transitionend() {
  if (!node || !originNode) return
  if (!state.preview) {
    originNode.style.opacity = '1'
    node.removeEventListener('transitionend', transitionend)
    node.removeEventListener('click', cancel)
    document.body.removeChild(node)
    originNode = null
    node = null
  }
}

function isCloneImageNode(el: Element) {
  return !isNull(el.getAttribute('preview-image'))
}

function getMaskRef(): HTMLDivElement {
  return maskRef.value! as HTMLDivElement
}
function showMask() {
  const el = getMaskRef()
  el.style.opacity = '0.6'
  el.style.zIndex = '1000'
}

function hideMask() {
  const el = getMaskRef()
  el.style.opacity = '0'
  el.style.zIndex = '-1'
}
</script>
<template>
  <div class="image-preview">
    <div ref="maskRef" class="mask" @click="cancel"></div>
  </div>
</template>
<style lang="scss">
.preview-image {
  cursor: zoom-out;
  transform: translate3d(0, 0, 0) scale(1);
  transition: transform 0.3s;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0);
  opacity: 0;
  transition: all 0.28s;
  z-index: -1;
  cursor: zoom-out;
}
</style>

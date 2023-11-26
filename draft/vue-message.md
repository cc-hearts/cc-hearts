---
title: 简易实现 vue3 message 组件
date: 2023-11-26
articleId: 89626945-b69a-4f98-88c2-d08e73b1efc5
---

# 简易实现

在绝大多数 UI 库中，`message` 组件都支持函数的调用方式，因此 `message` 组件的实现会与普通组件有所不同。
本文将展示如何简易实现一个 vue3 的 `message` 组件。

## 定义组件模版

与传统的 vue 组件开发方式相同，首先定义一个 `message` 组件

```tsx
type MessageType = 'success' | 'error' | 'warning'

// 构造一个 message 组件并且导出
export const MessageConstructor = defineComponent({
  name: 'Message',
  props: {
    text: {
      type: String as PropType<string>,
      required: true,
    },
    type: {
      type: String as PropType<MessageType>,
      default: 'success',
    },
    onAnimationEnd: {
      type: Function,
      default: noop,
    },
  },
  setup(props, { expose }) {
    const visible = ref(true)

    const onClose = () => {
      visible.value = false
    }

    expose({ onClose })

    const emitAnimationEnd = () => {
      props.onAnimationEnd?.()
    }
    return () => {
      return (
        <Transition name="msg" onAfterLeave={emitAnimationEnd}>
          {visible.value ? (
            <div
              class={` absolute top-20px left-50% z-2 translate-x--50% rounded-lg p-x-12px bg-white p-y-6px message-box`}
            >
              <span class="m-r-8px align-sub translate-y--1px">
                <CheckIcon />
              </span>
              <span>{props.text}</span>
            </div>
          ) : null}
        </Transition>
      )
    }
  },
})
```

## 构造调用函数

```ts
type MessageType = 'success' | 'error' | 'warning'

const genDivElement = () => document.createElement('div')
// 显示 message success 的方法
export const showSuccessMessage = (
  text: string,
  type: MessageType = 'success',
  delay = 3000
) => {
  // 生成一个 div 以供vNode 挂载
  const el = genDivElement()
  // 创建一个 vNode 并且挂载到 div 上
  // 与 createApp(App).$mount('#app') 作用相同
  const vNode = createApp(MessageConstructor, {
    text,
    type,
    onAnimationEnd: () => vNode.unmount(),
  })
  vNode.mount(el)
  // 将message 插入到 body 下
  document.body.appendChild(el.firstElementChild as HTMLElement)
  setTimeout(() => {
    // 延迟时间到移除message
    // 之后在过渡效果结束后执行 onAnimationEnd， 销毁 vNode
    vNode._instance?.exposed?.onClose()
  }, delay)
}
```

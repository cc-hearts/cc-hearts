---
title: Vue.observer API
---

在对一些第三方库进行查看时偶然发现有 `Vue.observer` 的使用

> 这里引用官方的例子：

```ts
const state = Vue.observable({ count: 0 })

const Demo = {
  render(h) {
    return h(
      'button',
      {
        on: {
          click: () => {
            state.count++
          },
        },
      },
      `count is: ${state.count}`
    )
  },
}
```

可以看出 `Vue.observable` 可以让响应式的数据对象脱离 Vue 传统的模版写法

接下来探究一下 `Vue.observable` 的实现

```ts
// src/core/global-api/index.ts
// 2.6 explicit observable API
Vue.observable = <T>(obj: T): T => {
  // 内部还是走了 observe 这个方法 这个方法 在初始化 data 的时候也会走
  // data = vm._data = isFunction(data) ? getData(data, vm) : data || {}
  // ...
  // var ob = observe(data)
  observe(obj)
  return obj
}
```

## 参考资料

- [vue2 observer 流程](./vue2-observer.md)

---
title: vue property decorator
---

在使用 `vue-class-components` 构建 Vue 组件时，像 `watch` 、`props` 等属性还是需要写在 `@Component` 中。

```ts
@Component({
  watch: {
    postId(id: string) {
      // To fetch post data when the id is changed.
      this.fetchPost(id) // -> Property 'fetchPost' does not exist on type 'Vue'.
    },
  },
})
class Post extends Vue {
  postId: string

  fetchPost(postId: string): Promise<void> {
    // ...
  }
}
```

这相当于还是 `options api`的写法。为了风格统一，一般会配合 `vue-property-decorator` 使用装饰器去实现 `watch` 等功能。

```ts
@Component
export default class Post extends Vue {
  postId: string
  fetchPost(postId: string): Promise<void> {
    // ...
  }

  @Watch('postId')
  onPostIdWatcher(val: string) {
    // ...
  }
}
```

本文将详细讲解 `vue-property-decorator` 中 `Api` 的实现。

## VModel

`VModel` 装饰器主要用于在 `props` 中声明 `value`，并且在 `value` 改变的时候 `emit` 一个 `input` 事件。（参考 `v-model`）

🌰 如下：

```vue
<template>
  <!-- Child.vue -->
  <div>
    <input v-model="val" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, VModel } from 'vue-property-decorator'
@Component
export default class Child extends Vue {
  @VModel({ type: String }) public val!: string
}
</script>
```

```vue
<template>
  <!-- App.vue -->
  <div id="app">
    <Child v-model="msg" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Child from './components/Child.vue'

@Component({
  components: {
    Child,
  },
})
export default class App extends Vue {
  msg = 'hello word'
}
</script>
```

可以看到使用了 `VModel` 修饰了 `val` 属性，在它改变的时候会触发 `input` 事件，并且注册了 `value` 属性在 `props` 中。

![image-20230831010853646](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-08-30/image-20230831010853646.png)

![image-20230831011402506](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-08-30/image-20230831011402506.png)

下面将探究一下 `VModel` 的实现：

```ts
import { PropOptions } from 'vue'
import { createDecorator } from 'vue-class-component'
export const vModal = function (options: PropOptions) {
  // 设置到 props 中的 key
  const valueKey = 'value'
  return createDecorator((componentOptions, key) => {
    // 判断是否有 props 没有则初始化
    ;(componentOptions.props || ((componentOptions.props = {}) as any))[
      valueKey
    ] = options
    // 将当前 VModel 修饰的属性值定义到 computed 中。
    // get的时候取 props.value
    // set的时候 emit input 事件
    ;(componentOptions.computed || (componentOptions.computed = {}))[key] = {
      get() {
        return Reflect.get(this, valueKey)
      },
      set(this: Vue, value: any) {
        this.$emit('input', value)
      },
    }
  })
}
```

## 参考文章

- <https://class-component.vuejs.org/>

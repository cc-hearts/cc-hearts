---
title: Element plus BEM 工具类/方法解析
date: 2023-05-28
articleId: 9f3a9267-2cbf-4456-88b6-cddce90ffe40
---

## element bem 工具类/方法解析

`element-plus` 源码中有一个 `useNamespace` 的 `hook` ， 用于生成 `BEM` 规范的 class 类名以及相关的变量名。

`useNamespace` 首先调用了 `useGetDerivedNamespace` 这个 `hook` 来获取命名空间。

```ts
export const namespaceContextKey: InjectionKey<Ref<string | undefined>> =
  Symbol('namespaceContextKey')

export const useGetDerivedNamespace = (
  namespaceOverrides?: Ref<string | undefined>
) => {
  // 获取默认的导出的命名空间 可以是父组件通过 provide 注入 或者是 默认的命名空间(defaultNamespace = 'el')
  const derivedNamespace =
    namespaceOverrides || inject(namespaceContextKey, ref(defaultNamespace))
  // 如果有参数 则返回参数
  // eg. useGetDerivedNamespace('cc') // => return 'cc'
  const namespace = computed(() => {
    return unref(derivedNamespace) || defaultNamespace
  })
  return namespace
}
```

### 注入的方式覆盖默认的参数命名空间

> e.g. 在 `App.vue` 中 `provide` 值

```vue
<script lang="ts" setup>
import Children from './children.vue'
// 需要使用它提供的Symbol key的注入名
import { namespaceContextKey } from '@element-plus/hooks'
import { ref, provide } from 'vue'
provide(namespaceContextKey, ref('cc'))
</script>
```

## useNamespace

`useNamespace` 的源码如下：

```ts
export const useNamespace = (
  block: string,
  namespaceOverrides?: Ref<string | undefined>
) => {
  // 获取命名空间
  const namespace = useGetDerivedNamespace(namespaceOverrides)
  // 生成block
  // eg.
  // const ns = useNamespcace('input')
  // ns.b('text') => 'cc-input-text' 以下的 em 设计按照BEM 规范皆如此
  const b = (blockSuffix = '') =>
    _bem(namespace.value, block, blockSuffix, '', '')
  const e = (element?: string) =>
    element ? _bem(namespace.value, block, '', element, '') : ''
  const m = (modifier?: string) =>
    modifier ? _bem(namespace.value, block, '', '', modifier) : ''
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element
      ? _bem(namespace.value, block, blockSuffix, element, '')
      : ''
  const em = (element?: string, modifier?: string) =>
    element && modifier
      ? _bem(namespace.value, block, '', element, modifier)
      : ''
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier
      ? _bem(namespace.value, block, blockSuffix, '', modifier)
      : ''
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier
      ? _bem(namespace.value, block, blockSuffix, element, modifier)
      : ''

  // 根据 State依赖生成 class
  const is: {
    (name: string, state: boolean | undefined): string
    (name: string): string
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0]! : true
    return name && state ? `${statePrefix}${name}` : ''
  }

  // 生成 css 变量
  const cssVar = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${key}`] = object[key]
      }
    }
    return styles
  }
  // with block
  const cssVarBlock = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${block}-${key}`] = object[key]
      }
    }
    return styles
  }

  // 获取 css 变量
  const cssVarName = (name: string) => `--${namespace.value}-${name}`
  const cssVarBlockName = (name: string) =>
    `--${namespace.value}-${block}-${name}`

  return {
    namespace,
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is,
    // css
    cssVar,
    cssVarName,
    cssVarBlock,
    cssVarBlockName,
  }
}
```

## useNamespace dts

```ts
export type UseNamespaceReturn = ReturnType<typeof useNamespace> // 返回useNamespace的返回值类型
```

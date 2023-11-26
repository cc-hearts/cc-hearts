---
title: immutable
date: 2023-06-13
articleId: ebb9656b-04fe-4184-b15e-7b4e92ee0777
---

# immutable

immutable 是一个概念，指的是一旦创建就不能被修改的对象。在编程中，这通常指的是不可变的数据类型，例如字符串、元组和数字。

在 javaScript 中，`immer` 和 `immutable` 是两个受众的实现了 immutable 的库。

## immer 功能介绍

相较于 `immutable` 库，`immer` 更加轻量简洁，几乎以最小的成本实现了 javaScript 中的不可变数据结构。

安装 `immer`：

```shell
pnpm i immer --save
```

基本使用：

```js
import { produce } from 'immer'

const state = {
  name: 'cc',
}

const nextState = produce(state, (draft) => {
  draft.name = 'cc-1'
})

console.log(nextState) // { name: 'cc-1' }
```

对于 recipe 函数，它修改 state 的时候有两种情况：

- 如果函数有返回值，则将返回的返回值作为改变后的状态机。
- 如果函数没有返回值，则使用 draft 修改后的值作为状态机。

> 同时修改 draft 和 return 了返回值会出现报错。
>
> `Error: [Immer] An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.`

此外，`produce` 提供了第三个参数用于监听状态机前后变化的值。

> 在 6 版本之后需要优先调用 `enablePatches` 才能启用 `patch` 功能。

```js
import { produce, enablePatches } from 'immer'

enablePatches()
const state = {
  name: 'cc',
}

const nextState = produce(
  state,
  (draft) => {
    return {
      name: draft.name + '-1',
    }
  },
  (nextPatch, oldPatch) => {
    console.log(nextPatch) // [ { op: 'replace', path: [], value: { name: 'cc-1' } } ]
    console.log(oldPatch) // [ { op: 'replace', path: [], value: { name: 'cc' } } ]
  }
)

// Patch 的类型声明：
//interface Patch {
//    op: "replace" | "remove" | "add";
//    path: (string | number)[];
//    value?: any;
//}
```

## immutable 功能介绍

安装 `immutable`：

```shell
pnpm install immutable
```

基本使用：

```js
import { Map } from 'immutable'

const originData = Map({
  name: 'cc',
  age: 18,
})

const changedData = originData.set({
  age: 20,
})

console.log(originData === changedData) // false
```

## 参考资料

[immer docs](https://immerjs.github.io/immer/)

[immutable-js](https://immutable-js.com/)

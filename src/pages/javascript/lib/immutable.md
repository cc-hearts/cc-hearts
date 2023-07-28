---
title: immutable
date: 2023-06-13
---

## 前言

immutable 是一个概念，指的是一旦创建就不能被修改的对象。在编程中，这通常指的是不可变的数据类型，例如字符串、元组和数字。

在 javaScript 中, `immer` 和 `immutable` 是两个受众的实现了 immutable 的库

## immer 功能介绍

相较于 `immutable` 库， `immer` 更加轻量简洁，几乎以最小的成本实现了 javaScript 中的不可变数据结构。

安装 `immer`

```shell
pnpm i immer --save
```

## immutable 功能介绍

安装 `immutable`

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

[immutable-js](https://immutable-js.com/)

---
title: path 模块
date: 2023-03-01
---

## path 模块

## resolve 和 join 的区别

> `resolve` 方法会把一个路径或路径片段的序列解析为一个绝对路径 生成的路径是规范化后的，且末尾的斜杠会被删除，除非路径被解析为根目录。 `join` 只是简单的将路径片段进行拼接。

```js
const { resolve, join } = require('path')
// 当前工作区的路径 /Users/heart/Desktop/day/fs
// resolve() 没有参数,返回当前工作区的路径
// 如果处理完 path 参数,返回加上当前工作区的路径
resolve() // /Users/heart/Desktop/day/fs

resolve('./fs-runtime') ///Users/heart/Desktop/day/fs/fs-runtime

resolve()

// path.join 只是简单的将路径片段进行拼接，并规范化生成一个路径
// join .
join()

join('data', '/a/b/c', '..') // data/a/b
```

## isAbsolute

判断是否是绝对路径

```js
const path = require('path')

// @see https://coldfunction.com/k/nodejs/path/isAbsolute
// https://nodejs.org/api/path.html
path.isAbsolute('/Users/heart/tet') // true
```

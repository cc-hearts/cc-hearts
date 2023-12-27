---
title: 基础 API
date: 2023-12-19
articleId: 14d17e1a-e3a8-4771-bdf4-a6d30eb03b91
---

# 基础 API

本篇文章会详细讲述 `Node` 中各种案例以及一些常用的 API 使用方法。

## Fs

### existSync

同步判断文件是否存在

```js
if (fs.existsSync(fileName)) {
  console.log('file exist')
}
```

### 文件流

- createReadStream

- createWriteSteam

### stat

### appendFile

### chmod

### copyFile

### mkdir

### rename

### rmdir

### unlink

### watchFile

### writeFile

### realpath

## Path

### isAbsolute

判断是否是绝对路径。

```js
const path = require('path')

// @see https://coldfunction.com/k/nodejs/path/isAbsolute
// https://nodejs.org/api/path.html
path.isAbsolute('/Users/heart/tet') // true
```

### sep

```js
path.sep // '/' 或者是 '\'
```

返回路径分隔符，Windows 返回 `\` POSIX 返回 `/`

### delimiter

返回操作系统环境变量的路径界定符，例如 Windows 返回 `;` POSIX 返回 `:`

```Shell
# Mac
/Users/heart/.bun/bin:/Users/heart/Library/pnpm
```

#### extname

返回最后一次出现的。(句点) 字符到字符串的结尾

```Javascript
const { extname } = require('path')

extname('jquery.min.js') // returns '.js'
extname() // returns ''

extname('foo/bar.md?foo=bar') // .md?foo=bar
```

> <https://nodejs.org/api/path.html#pathsep>

## FAQ

### resolve 和 join 的区别

`resolve` 方法会把一个路径或路径片段的序列解析为一个绝对路径，生成的路径是规范化后的，且末尾的斜杠会被删除，除非路径被解析为根目录。`join` 只是简单的将路径片段进行拼接。

```js
const { resolve, join } = require('path')
// 当前工作区的路径 /Users/heart/Desktop/day/fs

// resolve() 没有参数,返回当前工作区的路径
resolve() // /Users/heart/Desktop/day/fs

resolve('./fs-runtime') // /Users/heart/Desktop/day/fs/fs-runtime

// 绝对路径不会与当前工作区的路径进行拼接
resolve('/test') // /test

// path.join 只是简单的将路径片段进行拼接，并规范化生成一个路径
join() // join .

join('data', '/a/b/c', '..') // data/a/b
```

### 判断文件存在

判断文件存在推荐使用 `fs.access` 代替 `fs.exists`

对于 `fs.exists`，他的设计没有遵循 `nodejs` 的 `错误优先的回调函数`

> `node 20` 已经将 `fs.exists` 列入废弃的 API

```js
import { exists, access } from 'node:fs'

exists('/etc/passwd', (e) => {
  console.log(e ? 'it exists' : 'no passwd!')
})

// 使用 access 代替
access('text.txt', fs.constants.W_OK, (err) => {
  console.log(err)
})
```

## 参考文章

<https://www.yuque.com/sunluyong/node>

<https://www.yuque.com/egg/nodejs/xf5gaheg68v0e86g>

<https://cloud.tencent.com/developer/article/1688742>

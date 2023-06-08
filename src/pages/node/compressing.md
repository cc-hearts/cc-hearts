---
title: node 实现文件压缩
---

## node 实现文件压缩

> 前置：`tar` 是一种归档格式 它默认不会压缩。通常会结合`gzip` 将最终的`tar`文件以`gzip`格式压缩称为一个 `tar.gz`的文件 （通常缩写为`tgz`）

以下代码都需要安装第三方库`compressing`

```shell
npm i compressing
```

## `gzip` 压缩

### 常规实现 `gzip` 压缩/解压

```js
const compressing = require('compressing')
const { resolve } = require('path')
// compressing 普通用法

// gzip 压缩
compressing.gzip
  .compressFile(resolve(__dirname, './target.js'), 'target.js.gz')
  .then((res) => {
    console.log('compress file success:', res)
  })
  .catch((err) => {
    console.error('compress file error:', err)
  })

// gzip 解压
compressing.gzip
  .uncompress('target.js.gz', resolve(__dirname, 'target1.js'))
  .then((res) => {
    console.log('uncompress file success:', res)
  })
  .catch((err) => {
    console.error('uncompress file error:', err)
  })
```

### 通过 `Stream` 实现压缩/解压

```js
const { pipeline } = require('stream')
const compressing = require('compressing')
const { createReadStream, createWriteStream } = require('fs')
const { resolve } = require('path')
// compressing stream 方式

pipeline(
  createReadStream(resolve(__dirname, './target.js')),
  new compressing.gzip.FileStream(),
  createWriteStream('./target2.js.gz'),
  (err) => {
    if (err) {
      console.error('compress file error:', err)
    }
  }
)

// 解压缩
pipeline(
  createReadStream('./target2.js.gz'),
  new compressing.gzip.UncompressStream(),
  createWriteStream(resolve(__dirname, './target.comp.js')),
  (err) => {
    if (err) {
      console.error('uncompress file error:', err)
    }
  }
)
```

## 通过 `tar| gzip` 实现 `tgz`

### 常规方式实现压缩/解压

> `ls -al .` 会出现的字符串是
>
> `drwxrwxr-x@ 26 heart  staff     832 Jun  8 22:09 .`
>
> `r 读` `w 写` `x 执行`
>
> `drwxrwxr-x` 由四部分组成:
>
> 1. `d` 文件类型
>
> 2. `rwx` 文件所有者对该文件所拥有的权限
>
> 3. 第二个`rwx` 表示文件所属组对该文件所拥有的权限
>
> 4. `r-x` 表示其他用户对该文件所拥有的权限

```js
const compressing = require('compressing')
const { resolve } = require('path')
// compressing taz的实现
// tar | gzip > tgz
// 编译的结果(ls -al .)可知:
// target.build.tar: 1536       target.build.tgz: 88
compressing.tar
  .compressDir(
    resolve(__dirname, './target.js'),
    resolve(__dirname, './target.buid.tar')
  )
  .then(() => {
    return compressing.gzip.compressFile(
      resolve(__dirname, './target.buid.tar'),
      resolve(__dirname, 'target.buid.tgz')
    )
  })
  .then(() => {
    console.log('compress file success')
  })

// 文件存在则不会覆盖
// 解压
compressing.gzip
  .uncompress(
    resolve(__dirname, './target.buid.tgz'),
    resolve(__dirname, './target.runtime.tar')
  )
  .then(() => {
    compressing.tar.uncompress(
      resolve(__dirname, './target.runtime.tar'),
      resolve(__dirname, './target-runtime')
    )
  })
  .then(() => {
    console.log('uncompress success')
  })
```

### `Stream` 实现压缩

```js
const compressing = require('compressing')
const { createWriteStream } = require('fs')
const { resolve } = require('path')
const { pipeline } = require('stream')

// tar Stream 可以动态的添加 dir file buffer stream
const tarStream = new compressing.tar.Stream()
tarStream.addEntry(resolve(__dirname, './comp-tgz.js'))
tarStream.addEntry(resolve(__dirname, './target-runtime'))

const distStream = createWriteStream(resolve(__dirname, './target.dist.tgz'))
// 压缩
pipeline(tarStream, new compressing.gzip.FileStream(), distStream, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('success')
  }
})
```

## 参考资料

- <https://nodejs.org/en/docs/guides/backpressuring-in-streams>
- <https://zhuanlan.zhihu.com/p/33783583>

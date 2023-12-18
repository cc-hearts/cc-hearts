---
title: Node 入门
date: 2023-03-01
articleId: c11a08ff-9f8c-4f70-a70a-e379a61e15ed
---

# Node 入门

本篇文章会详细讲述 `Node` 中各种案例以及一些常用的 API 使用方法。

## 模块化

早期的 `Node` 版本中 (`v12.0.0` 之前的模块)，只支持 `CommonJs` 的模块化方式 (也就是使用 `require` 关键字引入模块)。随着 Javascript 生态系统的发展以及 ES6 标准的广泛应用。`Node` 也逐渐支持使用 ES Modules 的模块化方式 (使用 `import foo from 'baz'` 的方式引入模块)。

### CommonJs

NodeJs 的诞生要早于 ES6，因此在早期版本中，Node.js 使用的是一种类似于 CommonJS 的模块系统实现。并且遵循以下规则：

- 每个文件都被视为一个独立的模块，模块内部的变量、函数和对象默认是私有的，不会被其他模块直接访问。
- 在模块中，可以使用 require 函数来导入其他模块，并使用 module.exports 或 exports 对象来导出模块的内容。

> module.exports 是一个指向当前模块导出对象的引用。当模块被导入时，实际上是导入了 module.exports 对象的值。而 exports 是 module.exports 的一个辅助对象，最初与 module.exports 相同。

```javascript
// 导入
const myModule = require('./myModule')

// 导出
module.exports = {
  foo: 'bar',
  baz: 42,
}

// 或者使用 `exports` 对象的属性赋值方式导出：
exports.foo1 = 'bar'
exports.baz1 = 42
```

### ES Modules

Node 默认使用的是 CommonJs 规范定义的模块，如需使用 ES Modules 规范，需要在 `package.json` 中指定 `"type": "module"` 来启用支持。

```diff
{
  "version": "0.0.1",
+ "type": "module",
  "scripts": {}
}
```

> `package.json` 中的模块声明作用于 `.js` 文件，除此之外，还可以使用 `.cjs` 表示使用 CommonJs 规范的模块标准，使用 `.mjs` 表示 ES Modules 规范的模块化标准。

如果未指定 ES Modules 规范 (未在 `package.json` 中指定 `"type": "module"`)，直接导入使用 ES Modules 定义的。mjs 文件的模块控制台会报错：

```shell
# node index.js
import * as Test from './test.mjs
^^^^^^

SyntaxError: Cannot use import statement outside a module
```

### ES Modules 与 CommonJs 的区别

- ES Modules 导出的是一个一个的模块，而 CommonJS 是整个对象。
- CommonJS 在 require 文件的时候采用文件路径，并且可以忽略。js 文件扩展名。
- ES Modules 的 import 和 export 都只能写在最外层，不能放在块级作用域或函数作用域中。CommonJS 中是被允许的。
- require 是一个函数调用，路径是参数字符串，它可以动态拼接而 Import 可以作为函数动态导入。

> CommonJs 和 ES Modules 导入和导出的是模块的值的引用，而不是拷贝。这意味着模块间共享的数据可以在模块内部被修改，而这些修改会在其他导入该模块的模块中可见。

### 依赖加载

依赖优先级：内置模块 > 第三方模块

加载第三方模块时，会以项目为起始路径逐层往上寻找依赖 (使用 `module.paths` 可以查看具体的查找路径)。

```shell
# module.paths
[
  '/Users/heart/node_modules',
  '/Users/node_modules',
  '/node_modules',
  '/Users/heart/.node_modules',
  '/Users/heart/.node_libraries',
  '/Users/heart/.nvm/versions/node/v18.18.0/lib/node'
]
```

如果逐级向上查找不到依赖文件，则会去全局查找，遵循以下规则尝试加载依赖：

- `$HOME/.node_modules`
- `$HOME/.node_libraries`
- `$PREFIX/lib/node`

> `$HOME` 是用户的根目录，`$PREFIX` 是 node 中配置的 `node_prefix`

> <https://nodejs.org/docs/latest-v12.x/api/modules.html#modules_loading_from_node_modules_folders>

## 基础 API

### Path

#### isAbsolute

判断是否是绝对路径。

```js
const path = require('path')

// @see https://coldfunction.com/k/nodejs/path/isAbsolute
// https://nodejs.org/api/path.html
path.isAbsolute('/Users/heart/tet') // true
```

#### sep

```js
path.sep // '/' 或者是 '\'
```

返回路径分隔符，Windows 返回 `\` POSIX 返回 `/`

#### delimiter

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

#### 判断文件存在

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

- <https://cloud.tencent.com/developer/article/1688742>

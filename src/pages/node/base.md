---
title: Node 模块化
date: 2023-03-01
articleId: c11a08ff-9f8c-4f70-a70a-e379a61e15ed
---

# Node 模块化

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

依赖加载优先级：内置模块 > 第三方模块

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

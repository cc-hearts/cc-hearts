---
title: 简易实现 html playground
date: 2023-10-18
articleId: c3891dd9-a412-4d14-8bf5-1797f8549a6f
---

# 简易实现 html playground

探究了一下 `webpack` 的打包机制后发现，`webpack` 在 `eval` 下会将模块打包成 `IIFE` + 类似 `Commonjs` 的形式运行，又受到 `vue playground` 的启发，便想实现一个简易的 `html playground`

## webpack 编译代码分析

首先理解 `webpack` 打包后的 `IIFE` 的代码，🌰 如下：

```js
// index.js
function add(num1, num2) {
  return num1 + num2
}
console.log(add(1, 2))
```

```js
;(() => {
  'use strict'
  // __webpack_modules__ 打包的各个模块会亿 kv的形式集中在这个变量中
  var __webpack_modules__ = {
    './index.js': (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      eval(
        '__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data */ "./data.js");\n\n\nconsole.log((0,_data__WEBPACK_IMPORTED_MODULE_0__.add)(1, 2));\n\n\n//# sourceURL=webpack://webpack-build/./index.js?'
      )
    },
  }
  // 模块导入缓存变量
  var __webpack_module_cache__ = {}
  // require 加载模块的函数 在 ast 的过程中会将 import 替换为 这个
  function __webpack_require__(moduleId) {
    // 如果有缓存 取缓存的值
    var cachedModule = __webpack_module_cache__[moduleId]
    if (cachedModule !== undefined) {
      return cachedModule.exports
    }
    // 初始缓存变量
    var module = (__webpack_module_cache__[moduleId] = {
      exports: {},
    })
    // 没有缓存 则导入模块 __webpack_modules__ 会将模块和代码 以kv的形式存储 v是一个函数 内部会执行 eval
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__)

    return module.exports
  }

  // 剩下则向 __webpack_require__ 函数上初始化一些静态的函数
  ;(() => {
    __webpack_require__.d = (exports, definition) => {
      for (var key in definition) {
        if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          })
        }
      }
    }
  })()
  ;(() => {
    __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop)
  })()
  ;(() => {
    __webpack_require__.r = (exports) => {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module',
        })
      }
      Object.defineProperty(exports, '__esModule', { value: true })
    }
  })()

  // 入口函数导入
  var __webpack_exports__ = __webpack_require__('./index.js')
})()
```

从上述的代码可以看出最后会将模块的路径编译成 `key`，而对应的 `value` 则是一个包含了模块逻辑的函数
下面我们将实现一个简易的 `playground` 并且可以使用 `javascript module` 的功能

## 编译模块

参考 `webpack` 的编译逻辑，我们将会把每个 `js` 模块编译成一个函数，并且重写 `import` `export` 关键字

例如我们在 `playground` 中写下如下的 `script` 代码

```js
// utils.js
export function add(num1, num2) {
  return num1 + num2
}

// index.js
import { add } from './utils.js'
add(1, 2) // 3
```

经过编译之后的代码为：

```js
// utils.js
function add(num1, num2) {
  return num1 + num2
}
__exports('a.js', 'add', add)

// index.js
const { add } = await __require('a.js')
add(1, 2) // 3
```

可以看到 `__exports` 主要实现导出的功能，而 `__require` 则实现的是导入的功能

如何将 `import`、`export` 这些关键字转换成 `__exports` 这些变量名呢？

这里将使用 `babel` 对源代码转换成 `AST`，并在 `traverse` 时对代码进行一定程度的改造，基本的代码模版如下：

```js
function transform(code: string, fileName = '') {
  // 首先将源代码转换成 AST
  const ast = babel.parse(code, {
    sourceType: 'module',
  })
  // 之后在 traverse 阶段进行修改
  babel.traverse(ast, {
    // ...
  })
```

这里我们将主要对 `ImportDeclaration`、`ExportNamedDeclaration`、`ExportDefaultDeclaration` 这三个阶段进行操作

### ImportDeclaration

首先是 `ImportDeclaration` 阶段的操作

```js
{
   ImportDeclaration(path) {
       // 获取 import 的
        const importStringLiteral = path.node.source.value
        const defaultKey = Symbol('default')
        let isExistsNamespaceKey = false
        const namespaceKey = Symbol('namespace')
        // 对当前模块的 import 关键字导入进行一些处理
        const __import = path.node.specifiers.reduce<
          Record<string | symbol, string>
        >((acc, specifiers) => {
          const { type } = specifiers
          const name = specifiers.local.name
          if (type === 'ImportDefaultSpecifier') {
            // 记录默认导入的情况
            // import a from './utils.js'
            Reflect.set(acc, defaultKey, name)
          } else if (type === 'ImportSpecifier') {
            // 记录普通导入的情况
            // import { a } from './utils.js'
            Reflect.set(acc, name, name)
          } else {
            // 记录导入整个模块的情况
            // import * as U from './utils.js'
            Reflect.set(acc, namespaceKey, name)
          }
          return acc
        }, {})
        // importVariable 记录从模块导入的变量名称
        const importVariable: string[] = []
     // 对默认导入以及整个模块的导入进行特殊处理
     // 例如 默认导入 import a from './utils.js'
     // 后续将会处理成 const {default: a} = await __require('./utils.js')
        ;[defaultKey, namespaceKey].forEach((key) => {
          if (__import[key] !== void 0) {
            let prefix = ''
            if (key === defaultKey) {
              prefix = 'default : '
            } else {
              isExistsNamespaceKey = true
              prefix = ''
            }
            importVariable.push(`${prefix} ${Reflect.get(__import, key)}`)
          }
        })
     // Object.values 不会遍历 Symbol 属性 这里会将普通的导入加入到 `importVariable` 变量中
        Object.values(__import).reduce<string[]>((acc, value) => {
          acc.push(value as string)
          return acc
        }, importVariable)
     // 如果是整个模块导入 则不需要 {}
     // const Utils = __require('./utils')
        const __importVariable = isExistsNamespaceKey
          ? importVariable.join(',')
          : `{${importVariable.join(',')}}`
        // 生成 const { xxx } = require(path) 的结构
        const new_ast = babel.template.ast(
          `const ${__importVariable} = await __require("${importStringLiteral}");`,
        )
        // 替换原有的 import 导入
        if (new_ast) path.replaceWith(new_ast)
      }
}
```

在这一阶段，完成了对 `导入默认值`，`命名导入`，`整体模块导入（命名空间导入）` 进行了一个统一的处理，使其导入的结果为 `__require` 函数的返回值，完成 `import` 的处理后，接下来便是对 `export` 进行处理

这里我们将 `export` 的处理分为两个不同的阶段，分别是 `ExportDefaultDeclaration` (对默认导出的处理)、`ExportNamedDeclaration` (对命名导出的处理)

### ExportNamedDeclaration

举个 🌰，对于 `export const a = 1` 需要将它处理成 `__exports(filename, 'a', 1)`，这里的 `filename` 自然就是当前变量所属的模块名称

```js
const newExportAst = (fileName: string, name: string, value: string) => {
  return babel.template.ast(
    `__exports("${fileName}", "${name}", ${value});`,
  )
}

{
   // export const a = 1 ====> __exports(filename, name, value)
    ExportNamedDeclaration(path) {
        // 获取 部分代码的值
       // 例如 export const a = 1
       // 获取的是 const a = 1 这一部分
       // 导出的部分通过 path.insertAfter 完成
        const declaration = path.node.declaration
        let name
        switch (path.node.declaration?.type) {
          case 'VariableDeclaration':
            name = path.node.declaration.declarations[0].id.name
            break
          case 'FunctionDeclaration':
            name = path.node.declaration.id?.name
            break
          default:
            // code ...
            break
        }
    if (name) {
          // 如果有名字 则是 命名导出
          const new_ast = newExportAst(fileName, name, name)
          path.replaceWith(declaration)
          path.insertAfter(new_ast)
        } else if (path.node.specifiers && path.node.specifiers.length > 0) {
          // e.g. export { a, b } 这种导出方式
          const exportName = path.node.specifiers.map(target => {
            return target?.exported?.name
          })
          exportName.forEach(name => {
            const new_ast = newExportAst(fileName, name, name)
            path.insertAfter(new_ast)
          })
          // 移除 export { a, b }
          path.remove()
        }
      },
}
```

### ExportDefaultDeclaration

```js
{
      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration
        // 判断是否有 name 没有的话则是匿名导出
        // export function() {}
        const name = declaration?.id?.name
        const new_ast = newExportAst(fileName, 'default', name || generate(path.node.declaration)?.code)
        if (name) {
          path.replaceWith(declaration)
          path.insertAfter(new_ast)
        } else {
          path.replaceWith(new_ast)
        }
      },
}
```

## 代码生成

```js
// 最后通过 transformFromAstSync 将 AST 转换成 code
babel.transformFromAstSync(ast)?.code
```

至此，一个简易的 `js module` 编译工作已完成

## API 实现

在上述中已经实现了对 `__require`、`__exports` 的编译，接下来，我们将对 `__require`、`__exports` 函数的具体实现

首先是 `__require` API，它接收一个 `path` 参数，用于加载对应的模块

先定义函数类型

```js
function __require(path) {
  // path的作用就是 从一大堆模块中找到对应的模块 然后加载
  // ...
  // 判断是否存在缓存 ，如果有缓存 直接读取缓存
  if (__exports._map[keys]) {
    return __exports._map[keys]
  }

  // 如果没有缓存，调用模块 将导出值存储在 `__exports._map` 中
  // 对于 __require.map 下面将会讲述这个变量的作用
  const func = __require._map[keys]
  if (func instanceof Function) {
    func(__require, __exports)
    return __exports._map[keys] || {}
  }
  // 兜底 返回 {}
  return {}
}
```

这里可以考虑之前的 `webpack` 的流程他会将模块编译成对象的形式，之后通过 `path` 映射对应的 `key` 进行加载

因此我们会在定一个存储所有模块的变量，这里将这个存储模块的变量定义在了 `__require` 的 `_map` 属性中

```js
__require.map = {}

// keys 代表 模块名 code 代表了经过babel 编译后的源代码
// 具体的核心逻辑如下： 通过 new Function 实现一个函数，并且在函数内部可以使用 __require 和 __exports
__require.map[keys] = new Function(
  '__require',
  '__exports',
  '(async () => {' + code + '\\n' + '})()'
)
```

而 `__exports` 实现的逻辑则比较简单

```js
function __exports(fileName, type, value) {
  // 初始化导出模块
  if (!__exports._map[fileName]) {
    __exports._map[fileName] = {}
  }
  // 导出具体的值
  __exports._map[fileName][type] = value
}
```

实现了两个关键 API 后，接下来就是定义解析入口路径，之后进行加载模块

```js
// e.g. entry = index.js
const entry = './index.js'
__require._map[entry]?.(__require, __exports) // 从入口进行加载模块
```

至此一个简易的 `js module` 工作流程已完成

## Import Map

`Import Map` 的可以添加第三方的导入映射功能，举个 🌰：

```html
<script type="importmap">
  {
    "imports": {
      "vue": "https://play.vuejs.org/vue.runtime.esm-browser.js"
    }
  }
</script>

<script type="module">
  // 通过 importmap 的定义，可以在浏览器中使用 esm 规范去引入第三方库
  import { ref } from 'vue'
  console.log(ref)
</script>
```

## 整体代码

`html playground` 以 `nuxt` 进行搭建，整体的 `Preview` 代码如下所示：

```tsx
import { defineComponent, watch, ref } from 'vue'
export default defineComponent({
  name: 'Preview',
  props: {
    html: {
      type: String,
      default: '',
    },
    style: {
      type: String,
      default: '',
    },
    compileModule: {
      type: Object,
      default: () => ({}),
    },
    entry: {
      type: String,
      default: 'app.js',
    },
  },
  setup(props) {
    const srcDoc = ref('')

    const updateSrcDoc = () => {
      const code = JSON.stringify(props.compileModule)
      srcDoc.value = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>test</title>
          <style>
            ${props.style}
          </style>
        </head>
        <body>
          <div id="app-iframe">
            ${props.html}
          </div>
          <script type="module">
          // 对importmap中的模块进行过滤
          const __import__map = ${importMapFields.value}
          async function __require(keys) {
            if (__exports._map[keys]) {
              return __exports._map[keys];
            }
            const func = __require._map[keys];
            if (func instanceof Function) {
              func(__require, __exports);
              return __exports._map[keys] || {};
            }
            // is exist import Map ?
            if (__import__map.includes(keys)) {
              return import(keys);
            }
            return {};
          }
          __require._map = {};

          function __exports(fileName, type, value) {
            if (!__exports._map[fileName]) {
              __exports._map[fileName] = {};
            }
            __exports._map[fileName][type] = value;
          }
          __exports._map = {};
          const code = ${code}
          const entry = "${props.entry}"
          Object.keys(code).forEach(keys => {
            __require._map[keys] = new Function("__require", "__exports", "(async () => {" + code[keys] + "\\n" + "})()")
          })
          __require._map[entry]?.(__require, __exports)
          </script>
        </body>
      </html>
    `
    }

    const updateSrcDebounce = updateSrcDoc
    watch(
      [() => props.html, () => props.style, () => props.compileModule],
      () => {
        updateSrcDebounce()
      }
    )
    return () => (
      <div class="w-full h-full box-border">
        <iframe
          sandbox="allow-scripts"
          class="w-full h-full"
          srcdoc={srcDoc.value}
        />
      </div>
    )
  },
})
```

## 结语

本文通过分析 `webpack` 的打包流程，实现了一个简易的 `html playground` 中的 `js module` 流程，在此之上添加了 `importmap` 的特性，使 `playground` 能够支持引入第三方库。

> 本文完整的代码在 [github 仓库](https://github.com/cc-hearts/html-playground.git)，感兴趣可以给个 star 支持一下

## 参考文章

- <https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script/type/importmap>

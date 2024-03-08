---
title: package.json 中的字段解释
---

> 本文主要简述 `package.json` 中的字段的定义以及用法，更多详细的内容请看官网定义

## main、module、exports

1. main 字段，main 字段主要定义了 CommonJs 模块的入口文件，其他模块使用 require 语句导入包的时候，会使用 main 字段定义的文件作为入口文件。

2. module 字段，与 main 字段相似，都是定义入口文件，与之不同的地方在于，module 字段是定义 ESM 模块的入口文件。

3. exports 字段，在 Node v12 版本的添加的新的模块和导出的字段，可以更加灵活的定义包的入口点。

   > exports 字段支持定义多个入口点和条件导出，已满足不同的使用场景和需求。
   >
   > ```json
   > {
   >   "exports": {
   >     "./package.json": "./package.json",
   >     "./*": "./*",
   >     ".": {
   >       "import": "./es/index.js",
   >       "types": "./types/components/index.d.ts"
   >     }
   >   }
   > }
   > ```

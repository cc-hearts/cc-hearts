---
title: assert 断言
---

> 建议都使用严格模式下的断言保证断言的严谨 （严格模式下 例如: `deepStrictEqual` 使用的是 `===` 判断，而`deepEqual` 使用的是`==`判断）

```js
const assert = require('node:assert/strict')

// actual - expected 判断严格相等
console.log(assert.deepStrictEqual([1, 2, 3], [1, 4, 3]));
```

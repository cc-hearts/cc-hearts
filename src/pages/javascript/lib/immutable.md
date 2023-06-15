---
title: immutable 入门
---

# immutable 入门

安装 `immutable`

```shell
pnpm install immutable
```

```js
import { Map } from "immutable";


const originData = Map({
  name: 'cc',
  age: 18
})


const changedData = originData.set({
  age: 20
})

console.log(originData === changedData); // false
```

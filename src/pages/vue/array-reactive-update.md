---
title: vue2 数组/对象响应式更新原理
date: 2023-10-03
articleId: 3cfd07c6-7955-44a8-94e8-0b93b6004f72
---

# vue2 数组/对象响应式更新原理

之前已经讲过了 vue2 的整个响应式的流程，本文将对 vue2 的数组/对象的响应式更新原理进行深入的解析，深入探究对象，数组以及基本的数据类型是如何通知 watcher 进行数据的响应式更新。

## 前置准备

首先搭建一个 vue2 的项目，并且写入一个调试模版。模版的意图也很简单，在 `data` 中创建一个数组以及一个对象，并且在 `mounted` 中对数组进行 `push` 操作。

```vue
<template>
  <div>
    <template v-for="item in result">
      <div :key="item">{{ item }}</div>
    </template>
    {{ obj.target }}
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      result: [1, 2, 3],
      obj: {
        target: 'this is obj',
      },
    }
  },
  mounted() {
    this.result.push(4)
  },
}
</script>
```

## 数组响应式更新

通过 `vscode debugger` 在 `mounted` 中进行断点，并且逐步步入查看 `push` 进行的操作。

![image-20231003210318906](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-10-03/image-20231003210318906.png)

可以看到 `push` 操作实际调用的是 `mutator` 这个匿名函数。通过上下文可知，这里对数组的一些方法进行了重写。

```ts
// src/core/observer/array.ts

// 获取数组原型链
const arrayProto = Array.prototype
// 创建一个对象并且将隐式原型链(__proto__)指向数组的原型链
export const arrayMethods = Object.create(arrayProto)
// 重写的数组的方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
]

methodsToPatch.forEach(function (method) {
  // cache original method
  // 缓存原有的方法
  const original = arrayProto[method]
  // 对方法进行重写 在保证调用原方法的同时，进行一些响应式的操作
  def(arrayMethods, method, function mutator(...args) {
    // 调用原方法 并且获得结果
    const result = original.apply(this, args)
    // 获取 observer 对象， 稍后用于广播 watcher 进行更新
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 如果 inserted 是 一个对象或者数组，进行响应式的初始化
    if (inserted) ob.observeArray(inserted)
    // notify change
    // ob.dep.notify 用于广播 watcher 进行 update 操作
    if (__DEV__) {
      ob.dep.notify({
        type: TriggerOpTypes.ARRAY_MUTATION,
        target: this,
        key: method,
      })
    } else {
      ob.dep.notify()
    }
    return result
  })
})
```

至此，可以看出重写数组部分 API 是为了在进行原有操作的基础上保持对数据的响应式。

这里或许会有疑问，为什么会有 `ob.dep.notify` 这样的操作，之前 `defineReactive` 中进行广播的操作不是 `dep.notify`？

再次深入 `defineReactive` 一探究竟，可以看到在 `Object.defineProperty` 之前，先对数据进行了响应式初始化的操作。

```ts
  let childOb = !shallow && observe(val, false, mock)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
   // ...
    },
    set: function() {
      // ....
    }
  }
  // observe 的用途是将 数组或者对象的值进行一个响应式的初始化过程，如果是基本的数据类型，则不会进行操作（返回的也是 undefined）
  function observe(
  value: any,
  shallow?: boolean,
  ssrMockReactivity?: boolean
): Observer | void {
    // 如果以及初始化过了 则直接返回 __ob__
  if (value && hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    return value.__ob__
  }
  if (
    shouldObserve &&
    (ssrMockReactivity || !isServerRendering()) &&
    // value 是数组或者是对象
    (isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value.__v_skip /* ReactiveFlags.SKIP */ &&
    !isRef(value) &&
    !(value instanceof VNode)
  ) {
    // 创建观察者类
    return new Observer(value, shallow, ssrMockReactivity)
  }
}

// 对 Observer 类进行分析：
```

再次对 `Observer` 进行分析，看他是如何处理 `__ob__` 以及数组的。

```ts
export class Observer {
  dep: Dep
  vmCount: number // number of vms that have this object as root $data

  constructor(public value: any, public shallow = false, public mock = false) {
    // 为 value 定义一个响应式的标识 __ob__, 并且 可以通过 value.__ob__ 找到当前的 Observer 实例对象
    def(value, '__ob__', this)
    // 如果 value 是一个数组
    if (isArray(value)) {
      if (!mock) {
        // 如果有原型链 对原型链进行更改
        // 如果调用了例如 push 的操作，则是调用的 arrayMethods.push， 在 arrayMethods.push 中会调用 Array.prototype.push 操作
        if (hasProto) {
          /* eslint-disable no-proto */
          ;(value as any).__proto__ = arrayMethods
          /* eslint-enable no-proto */
        } else {
          for (let i = 0, l = arrayKeys.length; i < l; i++) {
            // 如果不支持原型链，则将函数添加到对象上
            const key = arrayKeys[i]
            def(value, key, arrayMethods[key])
          }
        }
      }
      if (!shallow) {
        // 对数组里面的元素进行响应式初始化
        this.observeArray(value)
      }
    } else {
      // ...
    }
  }
}
```

此时在看 `defineProperty` 之前的 `let childOb = !shallow && observe(val, false, mock)` 可知，当 `val` 不是基本的数据类型的话，会创建一个 `__ob__` 的属性挂载在自身身上，而这个 `__ob__` 指向 `Observer` 的实例 (也是这里的 `childOb`)。之后在 `defineProperty` 的 `getter` 中对 `childOb` 又进行处理。

```ts
// 如果 childOb
if (childOb) {
  // 对象 数组通过这种方式进行添加依赖收集
  // 将 当前 watcher 进行收集
  childOb.dep.depend()
  if (isArray(value)) {
    // 如果 value 是一个数组对象 则每一个对象都将对当前的 watcher 进行收集
    dependArray(value)
  }
}

// ...
// e.__ob__.dep.depend(); 收集当前的 watcher
function dependArray(value) {
  for (var e = void 0, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    if (e && e.__ob__) {
      e.__ob__.dep.depend()
    }
    if (isArray(e)) {
      dependArray(e)
    }
  }
}
```

回到刚开始的 `mutator` 函数，先获取的 `this.__ob__` 就是绑定这个数组的 `Observer` 实例。`在通过 ob.dep.notify` 去发布消息给在 `defineProperty` 中通过调用 `childOb.dep.depend();` 收集的 `watcher`。

```ts
function mutator() {
  const result = original.apply(this, args)
  const ob = this.__ob__
  let inserted
  switch (
    method
    // ...
  ) {
  }
  // 发布消息 通知 watcher 进行 update 操作
  ob.dep.notify()
}
```

## 对象的 childOb

上述已经讲完数组如何进行响应式更新，接下来在解析对象的 `childOb` 是如何进行响应式更新的。

通过上述的分析，对象的响应式更新也可以大致猜测为 `xxx.dep.notify`，因为通过全文检索，找到了两个方法进行了 `ob.dep.notify` (得益于 `vue` 的源码规范)，分别是 `set` 和 `del` 方法。(这两个方法的逻辑比较简单，这里不多赘述)

> `set` 和 `del` 方法在：src/core/observer/index.ts

```ts
// 这两个方法会挂载到 `Vue` 的原型链上
// src/core/instance/state.ts
Vue.prototype.$set = set
Vue.prototype.$delete = del
```

## 总结

- 对于基本的数据类型，在 `defineProperty` 中通过闭包 `dep` 实现对数据的响应式更新。
- 对于数组类型，通过重写 `push` 等 API，并且对每个数组绑定一个 `Observer` 的实例对象 (`__ob__`)，通过 `__ob__` 的 `dep` 实现依赖收集以及广播视图更新。
- 对于对象类型，也是对每个对象绑定一个 `Observer` 的实例对象，之后对对象的每个属性进行递归响应式处理，如果属性的值是基本的数据类型，则还是使用闭包 `dep` 实现响应式更新。如果使用 `$set`、`$del` 则会通过 `__ob__` 的 `dep` 实现响应式更新。

## 参考资料

- [vue2 observer](./vue2-observer)

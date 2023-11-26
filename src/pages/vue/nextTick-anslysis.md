---
title: Vue 2 nextTick 源码解析
date: 2023-03-01
articleId: 253d74c7-6c26-4561-a1e2-84d3ab6b850f
---

# Vue 2 nextTick 源码解析

Vue DOM 更新采用的是异步的更新策略，每次监听到数据发生变化的时候不会立即去更新 DOM 而是将这一次更新 DOM 的事件缓存到一个任务队列中。
这样的好处就是**通过异步任务队列的方式将多次更新数据的操作合并为一个调度，从而有效地减少 DOM 重绘的次数**，本文将从将从 `nextTick` 源码角度去分析内部实现原理 (这里不做 `issue` 的分析)。

## nextTick 解析

nextTick 接收一个回调函数作为参数。该回调函数将在 DOM 更新之后执行，因此可以使用 nextTick 来延迟对基于最新数据生成的 DOM 进行操作。

nextTick 提供了四种异步的方法：`Promise.then`、`MutationObserver`、`setTimeout`、`setImmediate` 前两种是微任务后两种是宏任务

```ts
/* globals MutationObserver */

// noop 表示一个无操作空函数，用作函数默认值，防止传入 undefined 导致报错
import { noop } from 'shared/util'
// handleError 是一个错误处理函数，用于捕获异步操作中的错误
import { handleError } from './error'
//  isIE, isIOS, isNative 环境判断函数，
//  isNative 判断某个属性或方法是否原生支持，如果不支持或通过第三方实现支持都会返回 false
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false // 标记nextTick是否以微任务执行

// 维持一个回调函数队列
const callbacks: Array<Function> = []

// 用来控制任务队列依次能够推入 event loop 中
let pending = false

// 开始批量执行更新队列的操作
function flushCallbacks() {
  // 恢复等待状态
  pending = false
  // 浅拷贝一份任务队列 并且将任务队列清空
  // 防止在任务队列的回调函数中如果再调用nextTick函数 导致nextTick执行时机错乱的问题 而且可能会出现一直循环的问题
  // nextTick 中 在调用 nextTick 此次的nextTick应该在下一次的时机执行
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// 异步支持的方法：
let timerFunc

// 判断当前环境优先支持的异步方法，优先选择微任务
// 优先级：Promise---> MutationObserver---> setImmediate---> setTimeout
// setTimeout 可能产生一个 4ms 的延迟，而 setImmediate 会在主线程执行完后立刻执行
// setImmediate 在 IE10 和 node 中支持

// 判断是否支持Promise
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    // 利用then 将 flushCallbacks 包裹成一个异步的微任务
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
  // 标志为微任务
  isUsingMicroTask = true
} else if (
  // 如果不是ie并且浏览器支持 MutationObserver 也是一个微任务
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  // 利用 MutationObserver 改变 textNode的文本内容 触发flushCallbacks回调
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    // @see: https://developer.mozilla.org/zh-CN/docs/conflicting/Web/API/MutationObserver/observe_2f2addbfa1019c23a6255648d6526387
    characterData: true,
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    // 改变内容 触发更新
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(): Promise<void>
export function nextTick(cb: (...args: any[]) => any, ctx?: object): void
/**
 * @internal
 */
export function nextTick(cb?: (...args: any[]) => any, ctx?: object) {
  // 用于执行nextTick().then的操作
  let _resolve
  // 压入一个回调函数至任务队列中
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e: any) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // pending 实现了一个调度周期，只有第一次调用nextTick的时候，会将调度函数(flushCallback)压入到事件队列等待执行中
  // 在周期之内在调用nextTick添加cb时，只会将cb加入到调度队列中，不会新开一个调度任务
  // 当调度任务开始执行时，恢复 pending 状态，进行加载下一个调度周期
  // (这里的 timerFunc 每调用一次就相当于一次调度周期)
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    // 如果没有传入回调，并且当前环境支持 promise，就返回一个 promise
    // 此时外部通过.then执行的时候 DOM已经更新好了
    return new Promise((resolve) => {
      _resolve = resolve
    })
  }
}
```

## 参考资料

- <https://github.com/vuejs/vue/blob/main/src/core/util/next-tick.ts>

- <https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver>

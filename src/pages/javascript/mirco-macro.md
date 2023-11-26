---
title: 宏任务和微任务
date: 2023-08-21
articleId: 5d9e1c25-3cdf-4730-a7e9-7899729745b3
---

# 宏任务和微任务

## 事件循环机制

事件循环是一种用于处理异步任务的执行机制。在 JavaScript 中，事件循环是基于单线程的执行模型，用于处理事件和回调函数，以确保代码的顺序执行和异步任务的合理调度。

事件循环的核心思想是将任务分为两类：同步任务和异步任务。

- 同步任务：按照代码的顺序直接在主线程上执行的任务。在执行同步任务时，主线程会一直阻塞，直到当前任务执行完成，才会继续执行下一个任务。
- 异步任务：不会阻塞主线程的任务，其执行不会按照代码的顺序直接在主线程上进行。相反，异步任务会被放入任务队列中，等待主线程空闲时执行。

常见的异步任务有：

- setTimeout
- setInterval
- fetch/xmlHttpRequest
- event handler
- promise

根据队列中任务的不同，可以分为宏任务和微任务。

常见的宏任务有：

- setTimeout 和 setInterval
- I/O 操作 (网络请求、文件读取等)
- DOM 事件
- requestAnimationFrame
- script

> setTimeout 的误区：setTimeout 的回调不一定在指定时间后能执行。而是在指定时间后，将回调函数放入事件循环的队列中。

常见的微任务有：

- Promise 的 then/catch 回调
- async/await 的异步函数
- MutationObserver
- process.nextTick

## 浏览器的事件循环

1. 首先执行第一个宏任务 (全局的 script 脚本)，并且将产生的宏任务和微任务分别加入到各自的队列中。
2. 等待第一个宏任务执行完毕后，把当前的微任务队列清空，此时完成了一次事件的循环。
3. 取出下一个宏任务，同样把在此期间产生的回调函数加入到所属的队列中。之后在执行微任务队列并把它们清空，以此往复。

> 每次循环都可以看成是一个宏任务 + 微任务队列组成。

## Node 的事件循环

Node 的循环机制十分复杂，宏任务和微任务队列的调用也有优先级的区分。

`libuv` 上的事件循环的流程图如下：

![image-20230819030308012](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-08-18/image-20230819030308012.png)

简易的执行顺序分别是：

- timer 阶段 (执行注册的 setTimeout、setInterval 的一些回调，)
- Pending 态的 I/O 事件；(在大多数情况下，所有的 I/O 回调函数都会在 Poll I/O 后立即调用。但是，还存在一些情况，需要将这样的回调函数推迟到下一次循环迭代中调用。如果上一次循环延迟了任何 I/O 回调函数，则会在此时调用它。tcp 连接失败发送错误信息的 🌰)
- 空转事件；(`setImmediate` 使用了空转事件) 如果有空转事件 `timeout` 会设置为 0，后续的 Poll I/O 将不会阻塞
- 准备事件；Node 内部执行
- Poll I/O 事件；1。执行异步 I/O 的回调。2。计算当前轮询阶段阻塞后续阶段的时间 (是根据 `timeout` 来判断，0 不阻塞， -1 一直阻塞，常数则阻塞到指定的时间)
- 复查事件；(如果有空转事件会在此住执行)
- 扫尾。

> 一般关注的点是：定时器阶段、Poll I/O 事件阶段、复查事件这三个阶段

node 端微任务也有优先级先后：

1. process.nextTick；
2. promise.then 等；

先执行 nextTick，后续在执行其他的微任务。

## 补充：timer

对于 `setInterval` 和 `setTimeout`：

- `setTimeout` 在计时结束后会将对应的 `handler` 推入到任务队列中。
- `setInterval` 则是根据计时的时间每隔一段时间往队列中添加一次。**如果队列中存在之前由其添加的回调函数，就会放弃本次的添加 (不会影响之后的计时)**

## 参考文章

- <https://juejin.cn/post/7073099307510923295?searchId=202308170001066FA6C62E0A76849DCB7B#heading-4>

- <https://juejin.cn/post/7259927532249710653?searchId=20230816211241DCFD103A8830918A5652#heading-12>

- <http://docs.libuv.org/en/v1.x/design.html>

- <https://nodejs.org/zh-cn/docs/guides/event-loop-timers-and-nexttick>

- <https://juejin.cn/post/7002106372200333319>

---
title: mitt 源码解析
date: 2023-06-27
---

# mitt 源码解析

`mitt` 是一个轻量级的发布订阅库， 可以在任何 `javaScript runtime` 的环境中运行。

[源码地址](https://github.com/developit/mitt/blob/main/src/index.ts)

```ts
// 事件类型
export type EventType = string | symbol

// 事件句柄的类型声明
export type Handler<T = unknown> = (event: T) => void

export type WildcardHandler<T = Record<string, unknown>> = (
  type: keyof T,
  event: T[keyof T]
) => void

export default function mitt<Events extends Record<EventType, unknown>>(
  all?: EventHandlerMap<Events>
): Emitter<Events> {
  type GenericEventHandler =
    | Handler<Events[keyof Events]>
    | WildcardHandler<Events>

  all = all || new Map()

  return {
    all,
    // on订阅事件
    on<Key extends keyof Events>(type: Key, handler: GenericEventHandler) {
      // 获取订阅的类型的事件列表
      const handlers: Array<GenericEventHandler> | undefined = all!.get(type)
      if (handlers) {
        handlers.push(handler)
      } else {
        // 初始化订阅类型的事件数组列表
        all!.set(type, [handler] as EventHandlerList<Events[keyof Events]>)
      }
    },

    // 取消事件的订阅
    off<Key extends keyof Events>(type: Key, handler?: GenericEventHandler) {
      const handlers: Array<GenericEventHandler> | undefined = all!.get(type)
      if (handlers) {
        if (handler) {
          handlers.splice(handlers.indexOf(handler) >>> 0, 1)
        } else {
          all!.set(type, [])
        }
      }
    },

    // 事件发布
    emit<Key extends keyof Events>(type: Key, evt?: Events[Key]) {
      // 订阅的事件 slice() 浅拷贝 handlers 防止 handler 中订阅/取消订阅 对此时的事件队列的执行产生影响
      let handlers = all!.get(type)
      if (handlers) {
        ;(handlers as EventHandlerList<Events[keyof Events]>)
          .slice()
          .map((handler) => {
            handler(evt!)
          })
      }

      // * 订阅所有的事件类型
      handlers = all!.get('*')
      if (handlers) {
        ;(handlers as WildCardEventHandlerList<Events>)
          .slice()
          .map((handler) => {
            handler(type, evt!)
          })
      }
    },
  }
}
```

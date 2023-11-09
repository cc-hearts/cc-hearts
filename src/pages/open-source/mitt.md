---
title: mitt 源码解析
date: 2023-06-27
articleId: 7f838935-5c07-4656-9b7e-30dd8686dc72
---

`mitt` 是一个轻量级的发布订阅库，可以在任何 `javaScript runtime` 的环境中运行。

## 事件句柄的类型声明

在 `mitt` 中事件句柄 (在源码中名为 `handler`) 有两种类型声明：

```ts
// Handler WildcardHandler 都是事件句柄的类型声明
// 作用于on监听指定type时的事件句柄的类型声明
export type Handler<T = unknown> = (event: T) => void
// 作用于 on监听所有事件(*)时的事件句柄的类型声明
export type WildcardHandler<T = Record<string, unknown>> = (
  type: keyof T,
  event: T[keyof T]
) => void

// 对应以上两个事件句柄的队列的类型声明
export type EventHandlerList<T = unknown> = Array<Handler<T>>
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<
  WildcardHandler<T>
>
```

## all 的类型声明

`all` 作为收集事件句柄的容器，使用 `Map` 来映射 `EventType` 和事件队列的关系。

```ts
// 事件类型
export type EventType = string | symbol
// 收集依赖的Map的类型声明 每一个 key 都对应着一个事件队列
export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events | '*',
  EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>
```

## mitt 返回值类型声明

`mitt` 返回的对象类型，不多赘述。

```ts
export interface Emitter<Events extends Record<EventType, unknown>> {
  all: EventHandlerMap<Events>

  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void
  on(type: '*', handler: WildcardHandler<Events>): void

  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void
  off(type: '*', handler: WildcardHandler<Events>): void

  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void
  emit<Key extends keyof Events>(
    type: undefined extends Events[Key] ? Key : never
  ): void
}
```

## mitt 函数源码

```ts
export default function mitt<Events extends Record<EventType, unknown>>(
  all?: EventHandlerMap<Events>
): Emitter<Events> {
  type GenericEventHandler =
    | Handler<Events[keyof Events]>
    | WildcardHandler<Events>

  // all 可以由开发者自行传入进行受控
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

## 参考资料

[源码地址](https://github.com/developit/mitt/blob/main/src/index.ts)

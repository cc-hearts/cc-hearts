---
title: vue2 observer 流程
date: 2023-08-20
articleId: 83c483b7-a991-46bb-ac3f-e5035e5fe0df
---

本章节主要探究 vue2 是如何将数据进行响应式的，以及如何在更改响应式的时候去更新视图。

## 前置准备

创建一个 vue2 的项目

```shell
vue create analysis
```

修改 `App.vue` 模版

```vue
<template>
  <div id="app">
    {{ a }}
    <button @click="handleCLick">click me</button>
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      a: 1,
      b: { changelog: 2 },
    }
  },
  methods: {
    handleCLick() {
      this.a = 2
    },
  },
}
</script>
```

之后在 `main.js` 中打下 `debugger` ，并且通过 `vscode debugger` 进行调试。

> 需要先将项目启动，之后运行 `Launch Chrome`

![image-20230820221359984](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-08-20/image-20230820221359984.png)

逐步往下调试，可以看见 `data` 的初始化过程是在 `initState` 函数中 进行的 `initData`

> src/core/instance/state.ts

![image-20230820232807198](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-08-20/image-20230820232807198.png)

`initData` 函数中，主要的用途就是调用组件的 data 函数获取它的返回值，并且将返回值对象进行一个观测。

```ts
// initData 的函数体：
var data = vm.$options.data
data = vm._data = isFunction(data) ? getData(data, vm) : data || {}

var ob = observe(data)
ob && ob.vmCount++
```

这里主要关注 `observe` 函数，这个函数就是将 `data` 对象的属性逐一设置为响应式属性。

> src/core/observer/index.ts

```ts
export function observe(
  value: any,
  shallow?: boolean,
  ssrMockReactivity?: boolean
): Observer | void {
  if (value && hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    return value.__ob__
  }
  if (
    shouldObserve &&
    (ssrMockReactivity || !isServerRendering()) &&
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
```

`Observer` 类也如下：

> src/core/observer/index.ts

```ts
export class Observer {
  dep: Dep
  vmCount: number // number of vms that have this object as root $data

  constructor(public value: any, public shallow = false, public mock = false) {
    // this.value = value
    // 创建一个依赖收集器
    this.dep = mock ? mockDep : new Dep()
    this.vmCount = 0
    // 定义一个响应式的标识 __ob__ 用于标识该对象已经实现了 reactive 后续如果对这个对象进行 observe 可以直接返回改对象的 __ob__ 属性即可（__ob__ === 这次 new 的 Observer）
    def(value, '__ob__', this)
    if (isArray(value)) {
      if (!mock) {
        if (hasProto) {
          /* eslint-disable no-proto */
          ;(value as any).__proto__ = arrayMethods
          /* eslint-enable no-proto */
        } else {
          for (let i = 0, l = arrayKeys.length; i < l; i++) {
            const key = arrayKeys[i]
            def(value, key, arrayMethods[key])
          }
        }
      }
      if (!shallow) {
        this.observeArray(value)
      }
    } else {
      /**
       * Walk through all properties and convert them into
       * getter/setters. This method should only be called when
       * value type is Object.
       */
      const keys = Object.keys(value)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        // 如果是一个对象 将对象属性声明成响应式对象
        defineReactive(value, key, NO_INITIAL_VALUE, undefined, shallow, mock)
      }
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(value: any[]) {
    for (let i = 0, l = value.length; i < l; i++) {
      observe(value[i], false, this.mock)
    }
  }
}
```

`defineReactive` 这个函数就是将对象的属性使用 `Object.defineProperty` 去重写了 `getter` 和 `setter`

1. 在 `getter` 的时候， 调用 `dep.depend` 。
2. 在 `setter` 的时候， 调用了 `dep.notify` 。

> 如果直接看这里可能会有疑惑， `dep.depend` 以及 `dep.notify` 的作用可以根据后续讲的 `Dep` 类去理解。这里主要需要关注 `getter/ setter` 做了什么即可。

```ts
export function defineReactive(
  obj: object,
  key: string,
  val?: any,
  customSetter?: Function | null,
  shallow?: boolean,
  mock?: boolean
) {
  // 创建一个 依赖收集器 提供给 这个key 在 getter/setter的时候使用
  // dep 不挂载在任何对象上，只是通过闭包在 getter/setter 上使用（有返回dep 但是没有值去引用）
  const dep = new Dep()

  // 获取当前的属性是否允许配置
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if (
    (!getter || setter) &&
    (val === NO_INITIAL_VALUE || arguments.length === 2)
  ) {
    // 获取属性初始化的值
    val = obj[key]
  }

  // 如果获取的 val 是一个对象 或者数组 也进行响应观察
  let childOb = !shallow && observe(val, false, mock)
  // 使用 defineProperty 重写 getter setter 方法
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        if (__DEV__) {
          // 每一个属性都会闭包一个 dep 在 set的时候会通知更新
          dep.depend({
            target: obj,
            type: TrackOpTypes.GET,
            key,
          })
        } else {
          // 通过调用 dep.depend() 将 当前的 watcher 加入到 依赖中
          dep.depend()
        }
        if (childOb) {
          childOb.dep.depend()
          if (isArray(value)) {
            dependArray(value)
          }
        }
      }
      return isRef(value) && !shallow ? value.value : value
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val
      if (!hasChanged(value, newVal)) {
        return
      }
      if (__DEV__ && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else if (getter) {
        // #7981: for accessor properties without setter
        return
      } else if (!shallow && isRef(value) && !isRef(newVal)) {
        value.value = newVal
        return
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal, false, mock)
      if (__DEV__) {
        dep.notify({
          type: TriggerOpTypes.SET,
          target: obj,
          key,
          newValue: newVal,
          oldValue: value,
        })
      } else {
        // 通知以来更新
        dep.notify()
      }
    },
  })

  return dep
}
```

## Dep

从上文可以看出， `defineReactive` 里面不仅初始化了一个 `Dep` ，而且还使用了其相关的实例化对象的 API。

下面先看看 `Dep` 类的函数定义。

```ts
// 在 getter 的时候 会调用 depend
// 在 setter 的时候 会调用 notify
export default class Dep {
  static target?: DepTarget | null
  id: number
  subs: Array<DepTarget | null>
  // pending subs cleanup
  _pending = false

  constructor() {
    this.id = uid++
    // 初始化的时候， 会初始化一个依赖数组 subs
    this.subs = []
  }

  addSub(sub: DepTarget) {
    this.subs.push(sub)
  }

  removeSub(sub: DepTarget) {
    // #12696 deps with massive amount of subscribers are extremely slow to
    // clean up in Chromium
    // to workaround this, we unset the sub for now, and clear them on
    // next scheduler flush.
    this.subs[this.subs.indexOf(sub)] = null
    if (!this._pending) {
      this._pending = true
      pendingCleanupDeps.push(this)
    }
  }

  // 可以看到
  depend(info?: DebuggerEventExtraInfo) {
    if (Dep.target) {
      Dep.target.addDep(this)
      if (__DEV__ && info && Dep.target.onTrack) {
        Dep.target.onTrack({
          effect: Dep.target,
          ...info,
        })
      }
    }
  }

  notify(info?: DebuggerEventExtraInfo) {
    // stabilize the subscriber list first
    const subs = this.subs.filter((s) => s) as DepTarget[]
    if (__DEV__ && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      const sub = subs[i]
      if (__DEV__ && info) {
        sub.onTrigger &&
          sub.onTrigger({
            effect: subs[i],
            ...info,
          })
      }
      // 调用 watcher的update
      sub.update()
    }
  }
}

// 当前的 watcher 依赖项是谁 ，通过 pushTarget 设置
Dep.target = null
const targetStack: Array<DepTarget | null | undefined> = []

export function pushTarget(target?: DepTarget | null) {
  targetStack.push(target)
  Dep.target = target
}

// 移除 当前的 watcher
export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```

从其相关的 API 可以看出，Dep 类的 主要目的是用于收集一些依赖（通过 `depend` ），然后使用 `notify` 去通知依赖。

> 这里一种发布订阅的模式。 `getter/setter` 就已经相当于是一个 发布者（Publisher）， Dep 相当于了一个 事件调度的中心， 而 watcher 就相当于订阅者（Subscriber）。
>
> 只不过无论是添加依赖，还是通知依赖变化，都在上述的 `defineReactive` 中的 `getter/setter` 进行。

## Dep 的观察者的是谁?

从源码( `ts` )的角度查找，可以很快找到结果。

上述的 `depend` 可知， `Dep.target.addDep(this)` 这里的观察者的类型就是与 `Dep.target` 同类型的。

而 `Dep` 的 `static target?: DepTarget | null` 也可以看出，观察者的类型得是 `DepTarget` 。

从上下文检索可得，只有 `watcher` 实现了 `DepTarger`

```ts
export default class Watcher implements DepTarget {
  // ...
}
```

因此 `Dep.target` 可以是一个 `Watcher` 。

## watcher 什么时候创建？

> 这里暂时只先对渲染 watcher 进行解析。

这里聚焦于 `mountComponent` 函数，也就是 在 `beforeMount` ===> `Mounted` 的阶段。

有一个 `new Watcher` 的操作：

```ts
// 这里删减了 __DEV__ 的判断
export function mountComponent(
  vm: Component,
  el: Element | null | undefined,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    // @ts-expect-error invalid type
    vm.$options.render = createEmptyVNode
  }
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (__DEV__ && config.performance && mark) {
    // ...
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  const watcherOptions: WatcherOptions = {
    before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    },
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(
    vm,
    updateComponent,
    noop,
    watcherOptions,
    true /* isRenderWatcher */
  )
  hydrating = false

  // flush buffer for flush: "pre" watchers queued in setup()
  const preWatchers = vm._preWatchers
  if (preWatchers) {
    for (let i = 0; i < preWatchers.length; i++) {
      preWatchers[i].run()
    }
  }

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

此时的 `Watcher` 又做了什么呢？

将断点逐步步入，可以看到在经过一系列的初始化后，调用了 `this.get()`

![image-20230821004840631](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-08-20/image-20230821004840631.png)

> src/core/observer/watcher.ts

```ts
export default class Watcher implements DepTarget {
  // ...

  constructor(
    vm: Component | null,
    // 在 $mount的时候 传递的是一个 更新的数据
    expOrFn: string | (() => any),
    cb: Function,
    options?: WatcherOptions | null,
    isRenderWatcher?: boolean
  ) {
    recordEffectScope(
      this,
      // if the active effect scope is manually created (not a component scope),
      // prioritize it
      activeEffectScope && !activeEffectScope._vm
        ? activeEffectScope
        : vm
        ? vm._scope
        : undefined
    )
    if ((this.vm = vm) && isRenderWatcher) {
      vm._watcher = this
    }
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.post = false
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = __DEV__ ? expOrFn.toString() : ''
    // parse expression for getter
    if (isFunction(expOrFn)) {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
      }
    }
    this.value = this.lazy ? undefined : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get() {
    // 将当前的watcher设置为了 Dep.target
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      /**
       * 在$mount的过程中 通过调用这里的this.getter (updateComponent) 参考上面 mountComponent 传入的参数
       *   updateComponent = () => {
       *     vm._update(vm._render(), hydrating)
       *   }
       * 通过调用render 方法 编译模版字符串 并且通过调用依赖的getter方法获取依赖项。 注意此时已经设置了 Dep.target 为 当前的watcher
       * getter中的 dep.depend就会将当前的 watcher 加入到 deps 中
       */
      value = this.getter.call(vm, vm)
    } catch (e: any) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  addDep(dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps() {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp: any = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      // 如果数据更新了 会走 queueWatcher 进行一个调度的更新
      // 会将当前的watcher 加入到一个队列中，并且由 flushSchedulerQueue 统一在 nextTick(一般来说都是微任务) 中统一调度。
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run() {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          const info = `callback for watcher "${this.expression}"`
          invokeWithErrorHandling(
            this.cb,
            this.vm,
            [value, oldValue],
            this.vm,
            info
          )
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown() {
    if (this.vm && !this.vm._isBeingDestroyed) {
      remove(this.vm._scope.effects, this)
    }
    if (this.active) {
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
      if (this.onStop) {
        this.onStop()
      }
    }
  }
}
```

此后，如果数据更新，就会通过 `defineReactive` 中 `setter` 去通知所有的 `watcher` 进行 `update` 。

![image-20230821010332737](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-08-20/image-20230821010332737.png)

这时是先将需要更新的 `watcher` 加入到一个队列中。

![image-20230821010433457](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-08-20/image-20230821010433457.png)

之后将消费队列的函数放入到 `nextTick` 中，以便下一次 `macro/micro` 执行

![image-20230821010515399](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-08-20/image-20230821010515399.png)

```ts
function flushSchedulerQueue() {
  currentFlushTimestamp = getNow()
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(sortCompareFn)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // 上述排序完之后，这里就开始对 watcher 进行了调度 `watcher.run`,
  // `watcher.run`中调用了 `this.get()`
  // 此时的运行与 构造初始化调用的 get 一致。
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (__DEV__ && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' +
            (watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  resetSchedulerState()

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)
  cleanupDeps()

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}
```

## 总结

**整个 vue2 的响应式流程为**：

1. 先将 data 的每个属性进行 `defineReactive` 转化为 `Observer`。
2. 在 `defineReactive` 中对每个属性实现了 一个依赖收集器 Dep，用于存储观察者。
3. 在 组件挂载的时候，会创建一个 `wacher`。（这个 watcher 可以理解为渲染 `watcher`，用于观察所依赖的数据改变后，通知视图更新。也可以理解为所依赖的数据改变后，调用的 `updateComponent` 的函数）
4. 在创建一个用户 `watcher` 的时候，会调用 `this.getter`（相当于一个 `handler`，依赖项改变之后触发的回调），这个 `handler` 会创建出 `vNode`，期间如果对进行了 `Observer` 的属性进行了 `getter` 操作，就会将当前的 `watcher` 加入到该属性的 `dep` 中。（这整个过程也是一个发布订阅模式的一种应用）
5. 如果对进行了 `Observer` 的属性进行了 `setter` 操作（数据更新操作），则 `dep` 会进行广播通知 `watcher` 进行更新。此时所需要更新的 `watcher` 先 `handler` 加入到一个队列中，之后在 `nextTick` 进行统一的调度。

## 参考文章

- [发布订阅模式与观察者模式的区别](https://segmentfault.com/a/1190000038881989)

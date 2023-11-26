---
title: vue2 patch
date: 2023-10-04
articleId: 0d2781aa-9675-4fd0-b774-40470d328420
---

# vue2 patch

前面的文章已经阐述过数据是如何在改变的时候通知 watcher 进行 update，但对于 update 中的操作却还是一个黑盒，因此本文将深入探究 update 后的操作，去挖掘 vue2 是如何进行更新 DOM 以及 `virtual DOM` 是如何进行 Diff 对比来优化视图更新的。

## init

先通过启动模版并且使用 `vscode debugger` 断点步入到源码中，之后在 `vm._update(vm._render(), hydrating)` 处进行断点。

![image-20231004203115726](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-10-04/image-20231004203115726.png)

往下步入可以看到走的是 `Vue.prototype._update` 这个函数，重点的源码如下：

```ts
var prevVnode = vm._vnode // prevNode 就是当前的 vm的虚拟DOM
// 如果 prevVnode 不存在 说明是第一次创建
if (!prevVnode) {
  // initial render
  vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
} else {
  // 否则走更新
  // updates
  vm.$el = vm.__patch__(prevVnode, vnode)
}
```

可以看到不管是第一次初始化创建还是更新的的流程，走的都是 `patch` 的流程

- 如果是第一次初始化的流程，由于第一个 `oldVnode` 是一个真实的 DOM 因此会走 `oldVnode = emptyNodeAt(oldVnode)` 将这个真实的 DOM 映射成一个虚拟 DOM

```ts
function patch(oldVnode, vnode, hydrating, removeOnly) {
  if (isUndef(vnode)) {
    if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
    return
  }

  let isInitialPatch = false
  const insertedVnodeQueue: any[] = []

  if (isUndef(oldVnode)) {
    // empty mount (likely as component), create new root element
    // 这里一般是组件的第一次初始化所走的
    // vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    // 对比可知 此时的$el 还没有 因此 oldVnode 就会是 undefined
    // 而此时的 vnode 就是子组件的根元素
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue)
  } else {
    // 这里第一次
    const isRealElement = isDef(oldVnode.nodeType)
    // 如果旧的节点不是真实的DOM
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // patch existing root node
      // 这里基本上走的就是 update 的过程了
      patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
    } else {
      // 这里一般是第一次挂载走的流程
      if (isRealElement) {
        // mounting to a real element
        // check if this is server-rendered content and if we can perform
        // a successful hydration.
        if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
          oldVnode.removeAttribute(SSR_ATTR)
          hydrating = true
        }
        if (isTrue(hydrating)) {
          if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
            invokeInsertHook(vnode, insertedVnodeQueue, true)
            return oldVnode
          } else if (__DEV__) {
            // ...
          }
        }
        // either not server-rendered, or hydration failed.
        // create an empty node and replace it
        oldVnode = emptyNodeAt(oldVnode)
      }

      // replacing existing element
      const oldElm = oldVnode.elm
      const parentElm = nodeOps.parentNode(oldElm)

      // create new node
      createElm(
        vnode,
        insertedVnodeQueue,
        // extremely rare edge case: do not insert if old element is in a
        // leaving transition. Only happens when combining transition +
        // keep-alive + HOCs. (#4590)
        oldElm._leaveCb ? null : parentElm,
        nodeOps.nextSibling(oldElm)
      )

      // update parent placeholder node element, recursively
      if (isDef(vnode.parent)) {
        let ancestor = vnode.parent
        const patchable = isPatchable(vnode)
        while (ancestor) {
          for (let i = 0; i < cbs.destroy.length; ++i) {
            cbs.destroy[i](ancestor)
          }
          ancestor.elm = vnode.elm
          if (patchable) {
            for (let i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, ancestor)
            }
            // #6513
            // invoke insert hooks that may have been merged by create hooks.
            // e.g. for directives that uses the "inserted" hook.
            const insert = ancestor.data.hook.insert
            if (insert.merged) {
              // start at index 1 to avoid re-invoking component mounted hook
              for (let i = 1; i < insert.fns.length; i++) {
                insert.fns[i]()
              }
            }
          } else {
            registerRef(ancestor)
          }
          ancestor = ancestor.parent
        }
      }

      // destroy old node
      if (isDef(parentElm)) {
        removeVnodes([oldVnode], 0, 0)
      } else if (isDef(oldVnode.tag)) {
        invokeDestroyHook(oldVnode)
      }
    }
  }

  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
  return vnode.elm
}
```

这里解释一下根组件挂载与普通的组件创建为什么走的是不一样的流程：

- 根组件挂载会使用到 `$mount` 进行挂载，并且会传入一个选择器的标识符，详细见下图

![image-20231004210803143](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-10-04/image-20231004210803143.png)

之后会走 `mountComponent` 函数，这个函数会设置 `vm.$el = el`，然后在走 `update` 的流程，因此可以在第一次渲染的时候，`$mount` 所初始化时 `oldVnode` 是真实的 DOM

```  ts
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */) // 这里的vm.$el 就是上述 query(el)
```

- 组件初次挂载的话也会走 $mount，不过子组件创建的流程是

  ```ts
  craeteElm => createComponent => init => $mount => // ... 之后的流程和上述一样
  ```

  ![image-20231004220316237](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-10-04/image-20231004220316237.png)

不过组件是在 `init` 中走的 `child.$mount` 并且取值的是 `undefined`

## patch

从上述分析完初始化流程之后，在看更新的流程，他会调用 `patchVnode` 去对比更新前后的 DOM 快照从而对真实 DOM 进行修改，具体的源码如下：

> 对于变化的情况，大致可以分为四点：
>
> - 空节点/文本节点 -> 元素节点
> - 元素节点 -> 空节点/文本节点
> - 空节点 -> 文本节点
> - 文本节点 -> 空节点
>
> 因此这里的 `patchVnode` 根据 `vnode` 是否是文本节点进行判断，再根据新旧快照的子节点做进一步的处理

```ts
function patchVnode(
  oldVnode,
  vnode,
  insertedVnodeQueue,
  ownerArray,
  index,
  removeOnly?: any
) {
  // 新旧节点一样 跳过 patch的过程
  if (oldVnode === vnode) {
    return
  }

  if (isDef(vnode.elm) && isDef(ownerArray)) {
    // clone reused vnode
    vnode = ownerArray[index] = cloneVNode(vnode)
  }
  // 真实DOM 元素
  const elm = (vnode.elm = oldVnode.elm)

  if (isTrue(oldVnode.isAsyncPlaceholder)) {
    if (isDef(vnode.asyncFactory.resolved)) {
      hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
    } else {
      vnode.isAsyncPlaceholder = true
    }
    return
  }

  // reuse element for static trees.
  // note we only do this if the vnode is cloned -
  // if the new node is not cloned it means the render functions have been
  // reset by the hot-reload-api and we need to do a proper re-render.
  // 如果是静态的节点，并且新的节点如果是 v-once 或者是 通过clone 的到 则直接覆盖原有的节点
  if (
    isTrue(vnode.isStatic) &&
    isTrue(oldVnode.isStatic) &&
    vnode.key === oldVnode.key &&
    (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
  ) {
    vnode.componentInstance = oldVnode.componentInstance
    return
  }

  let i
  const data = vnode.data
  if (isDef(data) && isDef((i = data.hook)) && isDef((i = i.prepatch))) {
    // prepatch 操作
    i(oldVnode, vnode)
  }

  const oldCh = oldVnode.children
  const ch = vnode.children
  if (isDef(data) && isPatchable(vnode)) {
    for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
    if (isDef((i = data.hook)) && isDef((i = i.update))) i(oldVnode, vnode)
  }
  // 如果 vnode 没有 text 属性， 也就是判断是不是文本节点
  if (isUndef(vnode.text)) {
    // vnode 不是一个文本节点的情况 只能是空节点或者是元素节点了

    // 并且都存在子节点的话 对子节点进行更新
    // 稍后会对 updateChildren 进行详细讲述
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch)
        updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      // 只有 vnode 的子节点存在时
    } else if (isDef(ch)) {
      if (__DEV__) {
        checkDuplicateKeys(ch)
      }
      // 如果原来的节点是一个文本节点 则清空再添加子节点
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      // 此时的 vnode 没有子节点 但是又不是文本节点 只能是空节点了
      // 如果上一次快照的子节点存在 移除老的子节点
    } else if (isDef(oldCh)) {
      removeVnodes(oldCh, 0, oldCh.length - 1)
      // 若vnode和oldnode都没有子节点，但是oldnode中有文本
    } else if (isDef(oldVnode.text)) {
      // 清空oldnode文本
      nodeOps.setTextContent(elm, '')
    }
    // 这里走的是 vnode 是文本节点的操作
  } else if (oldVnode.text !== vnode.text) {
    // 更新文本节点
    nodeOps.setTextContent(elm, vnode.text)
  }
  // postPath的操作
  if (isDef(data)) {
    if (isDef((i = data.hook)) && isDef((i = i.postpatch))) i(oldVnode, vnode)
  }
}
```

总结一下判断的流程：

- 如果 `vnode` 是不是一个文本节点
  - 新旧快照都存在子节点，再 `updateChildren` 在进行递归进行 `patchVnode`
  - 新快照有子节点，旧快照没有子节点，则说明需要添加节点 (前提如果旧快照是一个文本元素，需要删除文本)
  - 新快照没有子节点 (又不是文本节点，所以只能是空节点了)，旧快照有子节点，则需要删除旧快照所有的子节点
  - 如果新旧快照都没有子节点，则说明新快照是一个空节点，对旧快照进行判断是否是文本节点，如果是删除文本即可
- 如果 `vnode` 是一个文本节点
  - 则说明不管旧快照里面的内容是什么，内容不一样则直接覆盖

## updateChildren

上述已经介绍了对于 `vnode` 的新旧快照对比的整体流程，但是对于新旧快照都存在子节点的情况，处理的逻辑会稍有不同，接下来将会详细述说 `updateChildren` 的具体实现逻辑

```ts
function updateChildren(
  parentElm,
  oldCh,
  newCh,
  insertedVnodeQueue,
  removeOnly
) {
  let oldStartIdx = 0 // 旧快照的开始指针
  let newStartIdx = 0 // 新快照的开始指针
  let oldEndIdx = oldCh.length - 1 // 旧快照的结束指针
  let oldStartVnode = oldCh[0] // 旧快照的开始指针所指向的值
  let oldEndVnode = oldCh[oldEndIdx] // 旧快照结束指针的所指向的值
  let newEndIdx = newCh.length - 1 //  新快照的结束指针
  let newStartVnode = newCh[0] //  新快照的开始指针所指向的值
  let newEndVnode = newCh[newEndIdx] // 新快照结束指针的所指向的值
  // 这里的变量用于后续的常规逻辑对比
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm

  // removeOnly is a special flag used only by <transition-group>
  // to ensure removed elements stay in correct relative positions
  // during leaving transitions
  const canMove = !removeOnly

  if (__DEV__) {
    checkDuplicateKeys(newCh)
  }
  // 这里我们将 oldStartIdx 称为旧前指针 oldEndIdx 称为旧后指针
  // 这里主要是用于迭代 新旧快照的两个数组 并且根据新的快照（newCh） 去更新旧快照（oldCh）的数据

  // 这里将会进行四个特殊的逻辑判断 分别是
  // 1.新快照的前置节点与旧快照的前置节点进行 vnode 对比 判断是否是同一个虚拟 DOM 如果是的话 对虚拟 DOM 进行 补丁操作
  // 2.新快照的后置节点与旧快照的后置节点进行 vnode 对比 与上一个判断逻辑相似
  // 3.旧快照的前置节点与新快照的后置节点进行 vnode 对比 如果是同一个 虚拟 DOM 则代表前后两次快照 组件的位置发生变化 需要移动位置
  // 4.旧快照的后置节点与新快照的前置节点进行 vnode 对比 与上一个判断逻辑相似
  // 5.进行常规的对比，将老节点遍历一遍拿到 key-i 的结构，再判断新快照的数据是否存在与老快照的数据中，
  //     如果存在，则进行 patchVnode 并且更改旧快照的 vnode 位置
  //        这里的存在先是对比 key 如果 key 相同但不是同一个元素，还是会呗认为是不同的元素，也会进行创建新的 DOM 结构
  //     如果不存在，则说明数据是新增的，则创建相应的 DOM 结构
  //   常规对比一般是遍历新快照节点的值进行对比的，因此只更新了 newStartIdx 指针

  // 当 where 走完后，后续将会对比 新快照和旧快照哪个先执行完，后续再对与剩下的未处理的节点进行处理
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
      // 新前与旧前对比节点
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(
        oldStartVnode,
        newStartVnode,
        insertedVnodeQueue,
        newCh,
        newStartIdx
      )
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
      // 新后与旧后对比节点
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
      // 旧前 与新后对比节点
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // Vnode moved right
      patchVnode(
        oldStartVnode,
        newEndVnode,
        insertedVnodeQueue,
        newCh,
        newEndIdx
      )
      // 移动元素的位置 移动到未处理节点的后面
      // insertBefore的源码在 src/platforms/web/runtime/node-ops.ts
      canMove &&
        nodeOps.insertBefore(
          parentElm, // 这里就是真实的DOM
          oldStartVnode.elm,
          nodeOps.nextSibling(oldEndVnode.elm)
        )
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
      // 旧后与新前对比节点
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // Vnode moved left
      patchVnode(
        oldEndVnode,
        newStartVnode,
        insertedVnodeQueue,
        newCh,
        newStartIdx
      )
      // 更新节点后移动位置
      canMove &&
        nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      // 如果不是上述的情况 则 走常规的循环对比的情况
      if (isUndef(oldKeyToIdx))
        // key - index 做一个 map
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      // 找到新节点对应在老节点中的下标值
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      // 如果节点不存在与老节点中， 说明是新增的节点 进行创建元素
      if (isUndef(idxInOld)) {
        // New element
        createElm(
          newStartVnode,
          insertedVnodeQueue,
          parentElm,
          oldStartVnode.elm,
          false,
          newCh,
          newStartIdx
        )
      } else {
        // 判断新老节点是不是同一个node， 如果是 进行更新老节点的值
        vnodeToMove = oldCh[idxInOld]
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(
            vnodeToMove,
            newStartVnode,
            insertedVnodeQueue,
            newCh,
            newStartIdx
          )
          oldCh[idxInOld] = undefined
          canMove &&
            nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
        } else {
          // same key but different element. treat as new element
          createElm(
            newStartVnode,
            insertedVnodeQueue,
            parentElm,
            oldStartVnode.elm,
            false,
            newCh,
            newStartIdx
          )
        }
      }
      newStartVnode = newCh[++newStartIdx]
    }
  }
  // where 结束之后就是未处理的节点了
  // 一个数组要么新增 删除 或者更改位置
  // 如果oldChildren比newChildren先循环完毕，说明了newChildren里面剩余的节点都是需要新增的节点，
  if (oldStartIdx > oldEndIdx) {
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
    addVnodes(
      parentElm,
      refElm,
      newCh,
      newStartIdx,
      newEndIdx,
      insertedVnodeQueue
    )
    // 如果newChildren比oldChildren先循环完毕，说明了oldChildren里面剩余的节点都是需要删除的节点
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(oldCh, oldStartIdx, oldEndIdx)
  }
}
```

> 这里进行的 `updateChildren` 将子节点对比也是调用的 `patchVnode`，递归到最后也就是判断 `文本节点/空节点` 的增删问题

## 总结

本文通过对 `patch` 流程的拆分，详细讲述了 Vue 2 中组件如何进行初始化渲染 DOM 和虚拟 DOM，以及每次更新后 DOM 差异对比的具体逻辑。在此基础上，以下是对该内容的一些总结：

- Vue 2 的组件初始化渲染过程主要包括以下几个步骤：首先，Vue 会将模板编译为渲染函数 (`vm.render`)，这个函数可以接收数据并返回一个虚拟 DOM 节点；然后，通过执行渲染函数，Vue 会生成一个初始的虚拟 DOM 树；接下来，Vue 会将虚拟 DOM 转化为真实的 DOM 节点 (也就是第一次运行 `update` 的操作，也进行了 `patch` 操作)，并插入到页面中。

- 在组件更新过程中，当数据发生变化时，Vue 会执行一个称为 `patch` 的过程，用于计算出新的虚拟 DOM 与旧的虚拟 DOM 之间的差异。补丁过程主要包括以下几个步骤：首先，Vue 会递归地比较新旧虚拟 DOM 节点的类型、属性和子节点等信息，找出差异；然后，Vue 会根据差异创建补丁对象，补丁对象记录了需要修改的具体操作；接着，Vue 会将补丁对象应用到真实的 DOM 节点上，完成更新。

- 对于 `pathVnode` 可以概括为：

  - 如果 `vnode` 是不是一个文本节点
    - 新旧快照都存在子节点，再 `updateChildren` 在进行递归进行 `patchVnode`
    - 新快照有子节点，旧快照没有子节点，则说明需要添加节点 (前提如果旧快照是一个文本元素，需要删除文本)
    - 新快照没有子节点 (又不是文本节点，所以只能是空节点了)，旧快照有子节点，则需要删除旧快照所有的子节点
    - 如果新旧快照都没有子节点，则说明新快照是一个空节点，对旧快照进行判断是否是文本节点，如果是删除文本即可
  - 如果 `vnode` 是一个文本节点
    - 则说明不管旧快照里面的内容是什么，内容不一样则直接覆盖

- 对于 `updateChildren` 的流程，可以概括为：
  1. 新快照的前置节点与旧快照的前置节点进行 vnode 对比判断是否是同一个虚拟 DOM 如果是的话对虚拟 DOM 进行补丁操作
  2. 新快照的后置节点与旧快照的后置节点进行 vnode 对比与上一个判断逻辑相似
  3. 旧快照的前置节点与新快照的后置节点进行 vnode 对比如果是同一个虚拟 DOM 则代表前后两次快照组件的位置发生变化需要移动位置
  4. 旧快照的后置节点与新快照的前置节点进行 vnode 对比与上一个判断逻辑相似
  5. 进行常规的对比，将老节点遍历一遍拿到 key-i 的结构，再判断新快照的数据是否存在与老快照的数据中，
     - 如果存在，则进行 patchVnode 并且更改旧快照的 vnode 位置
       - 这里的存在先是对比 key 如果 key 相同但不是同一个元素，还是会呗认为是不同的元素，也会进行创建新的 DOM 结构
     - 如果不存在，则说明数据是新增的，则创建相应的 DOM 结构
       常规对比一般是遍历新快照节点的值进行对比的，因此只更新了 newStartIdx 指针

## 参考资料

- [vue2 数组/对象响应式更新原理](./array-reactive-update)

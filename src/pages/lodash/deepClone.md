---
title: cloneDeep 源码解析
date: 2023-06-04
---

## 前言

本文将详细解析 lodash 库中 `cloneDeep` 方法的实现原理，同时提供示例代码和详细说明，帮助读者更好地理解 `cloneDeep` 的工作原理。

## cloneDeep

`cloneDeep` 等 其他 clone 方法 都依赖于 `baseClone` 这个方法

```js
function cloneDeep(value) {
  // CLONE_DEEP_FLAG 1
  // CLONE_SYMBOLS_FLAG 4
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG)
}
```

下面将逐步展开对 `baseClone` 的解析 首先是 `baseClone` 的参数：

```js
// value - 需要克隆的数据源
// bitmask - 标识 clone/cloneWith/cloneDeepWith/cloneDeep方法都依赖于baseClone
// customizer - 自定义的clone方法  cloneWith cloneDeepWith 方法依赖的参数
// key - value 的key值
// object - parent object的值
// stack - 用于缓存已经生成过的对象的值 用于解决循环依赖
function baseClone(value, bitmask, customizer, key, object, stack) {
  let result
  // ...
}
```

之后在函数体中，先对 clone 的职责进行了判断

```js
// 在cloneDeep 中 bitmask 就是 CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG
const isDeep = bitmask & CLONE_DEEP_FLAG // CLONE_DEEP_FLAG => 1
const isFlat = bitmask & CLONE_FLAT_FLAG // 0
const isFull = bitmask & CLONE_SYMBOLS_FLAG // CLONE_SYMBOLS_FLAG => 4
```

之后 优先运行 传入的 `customizer` 自定义的方法

```js
// 是否存在自定义的函数 存在则使用自定义的函数
if (customizer) {
  result = object ? customizer(value, key, object, stack) : customizer(value)
}
if (result !== undefined) {
  // 如果自定义的函数有返回值 则 本次clone 使用自定义函数的返回值为结果
  return result
}
// 如果是基本的数据类型 则直接返回结果
if (!isObject(value)) {
  return value
}
```

在 `isObject.js` 中

```js
// 判断是否是基本数据类型
function isObject(value) {
  const type = typeof value
  return value != null && (type === 'object' || type === 'function')
}
```

对于数组的 clone

```js
const isArr = Array.isArray(value)
// ...
if (isArr) {
  // 如果当前的value是数组 clone 数组的长度值 返回给 result
  result = initCloneArray(value)
  if (!isDeep) {
    // 如果不需要深度clone 则 clone 每一项给 result 之后 直接返回结果即可
    return copyArray(value, result)
  }
}
// ...
// 如果 是深度clone 则先走下面的 stack 暂存所有的引用类型  防止出现循环引用的时候clone结果错误
// const a = { b: c : 1 }
// a.b.c = a // 循环引用 通过cloneDeep之后 期望应该是 a.b.c === a // => true
stack || (stack = new Stack())
const stacked = stack.get(value)
if (stacked) {
  return stacked
}
stack.set(value, result)

const keysFunc = isFull
  ? isFlat
    ? getAllKeysIn
    : getAllKeys
  : isFlat
  ? keysIn
  : keys

// deep clone 数组 对象 都会走这里
const props = isArr ? undefined : keysFunc(value)
// deep clone 数据的时候。result 只是有一个length 的空数组 通过 arrayEach 对数组的每一项进行深度的clone
arrayEach(props || value, (subValue, key) => {
  if (props) {
    // 如果 deep clone 是一个对象 则 subValue 是 Object.keys(value)?.[index]的值（index 0 .. value.length - 1）
    key = subValue
    subValue = value[key]
  }
  // 递归 逐步拷贝每一项值
  assignValue(
    result,
    key,
    baseClone(subValue, bitmask, customizer, key, value, stack)
  )
})
```

> 对于 函数的 `clone` 返回的都是一个 `{}`

对于对象的 `clone`

```js
const isFunc = typeof value === 'function'
// clone buffer
if (isBuffer(value)) {
  return cloneBuffer(value, isDeep)
}
//  [object Object] [object Arguments]  isFunc && !object 代表是一个函数 不是一个方法
if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
  // 对象 arguments  函数 通过调用 initCloneObject 进行拷贝
  result = isFlat || isFunc ? {} : initCloneObject(value)
  if (!isDeep) {
    return isFlat
      ? copySymbolsIn(value, copyObject(value, keysIn(value), result))
      : copySymbols(value, Object.assign(result, value))
  }
} else {
  // 判断是否是WeakMap 或者Error等不能clone的类型
  if (isFunc || !cloneableTags[tag]) {
    return object ? value : {}
  }
  result = initCloneByTag(value, tag, isDeep)
}
```

## clone Function

`initCloneObject` 函数如下：

```js
function initCloneObject(object) {
  // 如果不是原型链的对象 clone的时候继承原型链
  return typeof object.constructor === 'function' && !isPrototype(object)
    ? Object.create(Object.getPrototypeOf(object))
    : {}
}
// 判断是否是 Function

// 判断对象是否是一个显示的原型链
// isPrototype(Date.prototype)
// 理清原型链的知识:
// Date.constructor === Function // true
// Date.prototype.constructor === Date // true
function isPrototype(value) {
  const Ctor = value && value.constructor
  const proto = (typeof Ctor === 'function' && Ctor.prototype) || objectProto

  return value === proto
}
```

`initCloneByTag` 函数如下

```js
function initCloneByTag(object, tag, isDeep) {
  const Ctor = object.constructor
  switch (tag) {
    // clone  Uint8Array
    case arrayBufferTag:
      return cloneArrayBuffer(object)

    // Boolean Date 转换成Number 在进行调用
    case boolTag:
    case dateTag:
      return new Ctor(+object)

    case dataViewTag:
      return cloneDataView(object, isDeep)

    case float32Tag:
    case float64Tag:
    case int8Tag:
    case int16Tag:
    case int32Tag:
    case uint8Tag:
    case uint8ClampedTag:
    case uint16Tag:
    case uint32Tag:
      return cloneTypedArray(object, isDeep)

    case mapTag:
      return new Ctor()

    // clone Number String
    case numberTag:
    case stringTag:
      return new Ctor(object)

    case regexpTag:
      return cloneRegExp(object)

    case setTag:
      return new Ctor()

    case symbolTag:
      return cloneSymbol(object)
  }
}
```

## clone Symbol

```js
const symbolValueOf = Symbol.prototype.valueOf
// clone symbol 的 valueof 属性值
function cloneSymbol(symbol) {
  return Object(symbolValueOf.call(symbol))
}

// const sym = symbol('foo')
// const cloneSym = cloneSymbol(sym) // 此时得到的是 一个Symbol原始值的包装类型
// cloneSym === sym // false
// cloneSym.toString() === sym.toStirng() // true
// cloneSym.valueOf() === sym.valueOf() // true
```

## clone RegExp

```js
const reFlags = /\w*$/ // 匹配后续 gmi 等标识符
function cloneRegExp(regexp) {
  // refgexp.source = 'a' reFlags.exec(regexp) // gi
  const result = new regexp.constructor(regexp.source, reFlags.exec(regexp))
  // clone 下一次匹配的起始索引
  // @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex
  result.lastIndex = regexp.lastIndex
  return result
}

// cloneRegExp(/a/gi)
```

## clone Set Map

```js
// 判断是否是 map 还是 set 之后递归设置值
if (tag == mapTag) {
  value.forEach((subValue, key) => {
    result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack))
  })
  return result
}

if (tag == setTag) {
  value.forEach((subValue) => {
    result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack))
  })
  return result
}
```

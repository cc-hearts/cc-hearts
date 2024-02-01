---
title: 常用操作类
---

# 常用操作类

## ArrayBuffer

```ts
// int8Array
let buffer = new ArrayBuffer(4) // 创建一个字节长度为 16 的 buffer
let view = new Uint32Array(buffer) // 将 buffer 视为一个 32 位整数的序列
console.log(view)
// Uint32Array(4) [0, 0, 0, 0]
// 让我们写入一个值
view[0] = 1234
// Uint32Array(4) [123456, 0, 0, 0]

// 在转换成int8Array 和 UInt8Array 的时候 由于超过边界了 将会进行数组切分
// 在UInt8Array 下 会 存储成 [210,4, 0, 0] // 4 * 256  + 210 = 1234

// 在int8Array下 1234 会存储成 [-46, 4, 0, 0] // 这里存储的是一个补码的形成
// 1234 转换成原码就是 10011010010
// 拆分成两段就是 00000100 11010010
// 因为int8Array存储的是补码 所以 会进行转换 前一段是正数 不变 就是 4
// 后一段是负数 负数的补码是 原码的反转末尾 + 1
// 因此是 10101110 // 这个数表示的就是 -46
```

> 总结：int8Array 存储的是以补码的形式存储的我们输入的数据是以原码的形式输入的。

## Date 类

### 从 Date 对象中获取时间

使用 Date 对象的。toTimeString() 方法转换为时间字符串，之后截取字符串即可

```javascript
const date = new Date()
// date.toTimeString() //'22:,2:,8 GMT+,8,, (中国标准时间)'
date.toTimeString().slice(0, 8) // 00:30:49
```

## String

### padStart 和 padEnd

> 字符串前置或者后置补全代码操作
>
> padStart 例如可以用作月份的前置加 0 操作

```typescript
export function preZeroDateReplace(str, target) {
  return str.padStart(target, '0')
}

describe('preZeroDateReplace result 01', () => {
  it('test', () => {
    expect(preZeroDateReplace(2, 2)).toBe('02')
  })
})
```

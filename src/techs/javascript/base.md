---
title: JavaScript 语法知识
date: 2023-12-09
articleId: b435f9ae-b5ac-446a-9727-4d0ac9a6e015
---

# JavaScript 语法知识

## 基本数据类型

六种基本数据类型：

- Number
- Null
- Boolean
- Undefined
- String
- Symbol (new in ES 6)

> 对于 Boolean 类型，只有 9 种隐式转换会变为 false，其余则都是 true。
> 参考：[mdn falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)
>
> 对于 Object 类型，对象的属性如果是整数，属性会被进行排序，其他属性则按照创建的顺序显示。

```ts
let codes = {
  '+49': 'Germany',
  '+41': 'Switzerland',
  '+44': 'Great Britain',
  // ..,
  '+1': 'USA',
}

for (let code in codes) {
  alert(+code) // 49, 41, 44, 1
}
```

### Number

JavaScript 中所有的数值类型都是 Number 类型 (并不区分浮点数和整数)
**Number 几个特殊的内置属性**
Number。MIN_VALUE 0 以上的最小值
Number。MAX_VALUE 最大值 (最大值并不等于无穷大)
几个内置的方法

```typescript
 // 把字符串转换成整数 取有效的整数，到非数字直接结束
parseInt(string: string, radix?: number): number;

parseFloat(string: string): number;
```

#### Infinity 全局属性表示一个数值是无穷大

```typescript
declare var Infinity: number
```

```javascript
Infinity === Infinity // true

Infinity === Infinity + 1 // true
```

#### NaN

```typescript
declare var NaN: number
```

- 任何值与 NaN 比较都会为 false (包括自己)

```javascript
NaN === NaN // false
```

NaN 与任何运算都是 NaN (除了 NaN \*\* 0)

```js
NaN ** 0 === 1 // true
```

#### 检测 NaN 的方法

1. Object.is(NaN,NaN) // true
2. Number.isNaN(NaN) // true
   > Object.is 与 === 不同的是 `===` 将 +0 与 -0 判断为相等而 Object.is 则判断正负 0 为不想等

```ts
Number.NaN === NaN // false
Object.is(Number.NaN, NaN) // true
Object.is(+0, -0) // false
```

#### isNaN 与 Number.isNaN 的区别

```js
isNaN('is') // true
Number.isNaN('is') // false
```

> isNaN 会对传入的值使用 toNumber 转换一次因此一些字符串会被转换成 `NaN` 在被判断是否为 NaN 则会被判断为 true

#### toExponential

`toExponential` 接收一个参数，表示结果中小数的位数。以指数表示法返回该数值字符串表示形式

```js
;(123).toExponential(2) // '1.23e+2'
;(1.23).toExponential() // '1.23e+0'
```

#### toPrecision

以指定的精度返回该数值对象的字符串表示

```js
const num = 99
console.log(num.toPrecision(1)) // "1e+2"
console.log(num.toPrecision(2)) // "99"
console.log(num.toPrecision(3)) // "99.0"
```

表示多少次方

```js
2 ** 53 // 2 的53次方
```

#### Number 的整数和安全整数

`MIN_SAFE_INTEGER MAX_SAFE_INTEGER`

两个值表示在 javascript 中最大和最小的安全整数

```ts
// 最大的整数
console.log(Number.MAX_VALUE)(
  // 1.7976931348623157e+308
  Math.pow(2, 53) - 1
) * Math.pow(2, 971) // 1.7976931348623157e+308
// 最大安全值
console.log(Number.MAX_SAFE_INTEGER) // 9007199254740991
console.log(2 ** 53 - 1)
```

为了鉴别整数是否在这个范围内，可以使用 `Number.isSafeInteger`

```js
console.log(Number.isSafeInteger(-1 * 2 ** 53)) // false
console.log(Number.isSafeInteger(-1 * 2 ** 53 + 1)) // true
console.log(Number.isSafeInteger(2 ** 53)) // false
console.log(Number.isSafeInteger(2 ** 53 - 1)) // true
```

#### 数字千分位表示

原生方法：

```js
;(3500).toLocaleString()
```

## 包装类

Boolean、Number 和 String

```js
let s1 = 'some text'
let s2 = s1.substring(2)
```

在这里，s1 是一个包含字符串的变量，它是一个原始值。第二行紧接着在 s1 上调用了 substring() 方法，并把结果保存在 s2 中。我们知道，原始值本身不是对象，因此逻辑上不应该有方法。而实际上这个例子又确实按照预期运行了。这是因为后台进行了很多处理，从而实现了上述操作。具体来说，当第二行访问 s1 时，是以读模式访问的，也就是要从内存中读取变量保存的值。在以读模式访问字符串值的任何时候，后台都会执行以下 3 步：

1. 创建一个 String 类型的实例；
2. 调用实例上的特定方法；
3. 销毁实例。

可以把这 3 步想象成执行了如下 3 行 ECMAScript 代码：

```js
let s1 = new String('some text')
let s2 = s1.substring(2)
s1 = null
```

```js
let s1 = 'some text'
s1.color = 'red'
console.log(s1.color) // undefined
```

这里的第二行代码尝试给字符串 s1 添加了一个 color 属性。可是，第三行代码访问 color 属性时，它却不见了。原因就是第二行代码运行时会临时创建一个 String 对象，而当第三行代码执行时，这个对象已经被销毁了。实际上，第三行代码在这里创建了自己的 String 对象，但这个对象没有 color 属性。

在原始值包装类型的实例上调用 typeof 会返回 “object”，所有原始值包装对象都会转换为布尔值 true

> Object 构造函数作为一个工厂方法，能够根据传入值的类型返回相应原始值包装类型的实例
>
> 使用 new 原始值包装类型的构造函数，与调用同名的转换函数的到的结果并不一样

```js
let value = '25'
let number = Number(value)
console.log(typeof number) // 转换函数  "number"
let obj = new Number(value)
console.log(typeof obj) // 构造函数  "object"
```

## 类型声明提升

只有声明本身会被提升，而赋值或其他运行逻辑会留在原地。如果提升改变了代码执行的顺序，会造成非常严重的破坏。

类型提升的两种情况：

- 函数声明
- var 变量

> 函数声明的优先级要比 var 变量声明的优先级要高，函数声明会被提升，但是函数表达式却不会被提升。

```javascript
foo() // TypeError
bar() // ReferenceError
var foo = function bar() {
  console.log('test')
}
```

var foo =  function bar 为函数表达式不会进行变量提升

```javascript
//函数声明的形式
bar() // test
function bar() {
  console.log('test')
}
var foo = bar
```

> 作用域中遍寻不到所需的变量，引擎就会抛出 ReferenceError 异常。

出现在后面的函数声明还是可以覆盖前面的

```javascript
function foo() {
  console.log('a')
}

function foo() {
  console.log('b')
}
foo() // b
```

## 运算符

### 算数运算符

- **任何值做 \* / - %都会变成 Number 类型 (加号例外)**
- **任何值和 NaN 运算都为 NaN**
- **任何值和 string 做加法运算，都会转化成 string，都会转化成 string 类型，然后做拼串操作**

```javascript
// 其他类型转化成string类型另外一种方法：
var a = '这里是其他数据类型' + '' //添加一个空字符串; //这里相当于隐式类型转换string() a的类型是string类型
```

- **对非 number 类型运算，会将这些值转换成 number 类型在运算 (加号的字符串运算不在内)**

- **+号在字符串前面可以进行转换成 number 类型**

### 比较运算符

> 两个字符串比较，比较字符的 unicode 编码比较字符编码是一位一位进行比较若一位比出高低后面则无需比较直接返回结果

字符串比较：JavaScript 会使用 “字典 (dictionary)” 或 “词典 (lexicographical)” 顺序进行判定。

> 换言之，字符串是按字符逐个进行比较的。

相等性比较符 (==) 和普通的比较符的代码逻辑是独立的 (>=, <=, >, <)

比较运算符会将 null 转换为数字因此 `null >= 0` 为 `true` (null 转换为数字是 0)

但是 (==) 不会转换 undefined 和 null 的值因此 `null == 0` 为 `false`

> `undefined == null` `true` 它们有自己独特的相等判断

## Function、function 与箭头函数

### function

在 javascript 中，每一个 `function` 都是一个 `Function` 对象

```javascript
;(function () {}).constructor === Function // true
```

### Function

Function 一般用于一个构造函数。

**语法：**

```javascript
new Function([arg1[, arg2[, ...argN]], ] functionBody)
```

```javascript
const func: Function = new Function('a', 'b', 'c', 'return (a+b)/c')

console.log(func(1, 3, 4)) // 1
```

> 使用 Function 构造器生成的函数，并不会在创建它们的上下文中创建闭包；它们一般在全局作用域中被创建。当运行这些函数的时候，它们只能访问自己的本地变量和全局变量，不能访问 Function 构造器被调用生成的上下文的作用域。

```javascript
globalThis.v = 1

function foo(a: number, b: number) {
  const v = 2
  const func: Function = new Function('a', 'b', 'c', 'return (a + b) / c + v')
  return func(a, b, 4)
}

console.log(foo(1, 3)) // 2
```

### 箭头函数

> 箭头函数不能被 new 执行，因为箭头函数没有 this，也没有 prototype
>
> JS 中的 Number 类型只能安全地表示-9007199254740991 (-(2^53-1)) 和 9007199254740991(2^53-1) 之间的整数，任何超出此范围的整数值都可能失去精度。

### 模板字符串函数调用

```ts
var a = 5
var b = 10

tag`Hello ${a + b} world ${a * b}`
// 等同于
tag(['Hello ', ' world ', ''], 15, 50)

function invoke(express, ...rest) {
  console.log(express, rest)
  return express
    .reduce((acc, cur, index) => {
      acc.push(cur)
      acc.push(rest[index])
      return acc
    }, [])
    .join('')
}

const name = 'Bob'
const email = 'test@example.com'
const res = invoke`SELECT 'My name is ${name} and my email  is ${email}'`

console.log(res)
```

> [mdn Template literals](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals)

## try catch finally

try 如果是一个函数 return 了但是 finally 还是会走

```js
;(() => {
  function log() {
    console.log('log')
  }
  try {
    return log()
  } catch (e) {
  } finally {
    console.log('finally')
  }
})()
```

## Map

map 相较于 Object，它的优势在于：

1. Object 的对象的键只能是字符串或者 Symbol，Map 的键值对可以是任意值。
2. Map 中的键值是有序的 (FIFO 原则)，而添加到对象中的键则不是。
3. Map 的键值对个数可以从 size 属性获取，而 Object 的键值对个数只能手动计算。
4. Object 都有自己的原型，原型链上的键名有可能和你自己在对象上的设置的键名产生冲突。

> map 的一些特殊判断：

```js
// key 是 NaN
let valueNaN = NaN
let NaNMap = new Map()

NaNMap.set(valueNaN, 'NaN')
//get
console.log(NaNMap.get(valueNaN)) // NaN
console.log(NaNMap.get(NaN)) // NaN
// 虽然 NaN 和任何值甚至和自己都不相等(NaN !== NaN 返回true)，NaN作为Map的键来说是没有区别的。
```

### Map 的迭代

`for of` 迭代：

```javascript
let map = new Map()

map.set(0, 'zero')
map.set(1, 'one')
// for of 迭代
for (let [key, value] of map) {
  console.log(key + '=' + value)
}
```

### WeakMap 和 Map 的区别

> node --expose-gc index.js
> \--expose-gc 参数表示允许手动执行垃圾回收机制

map 的堆内存使用情况

```typescript
function usedSize() {
  // 获取堆内存使用情况
  const used = process.memoryUsage().heapUsed
  return Math.round((used / 1024 / 1024) * 100) / 100 + 'M'
}

global.gc()
console.log(usedSize()) // 3.22M

const map = new Map()

let b = new Array(5 * 1024 * 1024)
map.set(b, 1)

b = null
global.gc()
// 此时的Array 无法被内存回收
console.log(usedSize()) // 43.28M
```

weakMap 内存使用情况

```javascript
function usedSize() {
  // 获取堆内存使用情况
  const used = process.memoryUsage().heapUsed
  return Math.round((used / 1024 / 1024) * 100) / 100 + 'M'
}

global.gc()
console.log(usedSize()) // 3.22M

const map = new WeakMap()

let b = new Array(5 * 1024 * 1024)
map.set(b, 1)

b = null
global.gc()
// 此时的Array 无法被内存回收
console.log(usedSize()) // 3.28M
```

可以看出 WeakMap 是对引用类型的弱引用不会限制引用类型被 gc 而 Map 会造成引用类型无法 gc 从而造成了内存泄漏。

> WeakMap 的键是弱引用对象 (包括 null)
> WeakMap 的弱引用只是键名不是键值
> WeakMap 的 key 不可被枚举

### Map 克隆

```javascript
let array = [
  ['key1', 'value1'],
  ['key2', 'value2', 'value3'],
]

let maps = new Map(array) //Map(2) { 'key1' => 'value1', 'key2' => 'value2' }
let maps2 = new Map(maps)
// Map 对象构造函数生成实例，迭代出新的对象。
console.log(maps === maps2) // false
console.log(maps2) // //Map(2) { 'key1' => 'value1', 'key2' => 'value2'}
```

### 合并

合并两个 Map 对象时，如果有重复的键值，则后面的会覆盖前面的

```javascript
var first = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
])
var second = new Map([
  [1, 'uno'],
  [2, 'dos'],
])

var merged = new Map([...first, ...second]) //对应值即 uno，dos， three
```

### 解构赋值

```javascript
let map = new Map();
map.set(1, 2) //Map(1) {1 => 2}
map.set(2, 3) //Map(2) {1 => 2, 2 => 3}
[...map] // [Array(2), Array(2)]
```

### 常用 API

#### entries()：MapIterator

entries 方法返回一个新的 Iterator 对象，它按插入顺序包含了 Map 对象中每个元素的 `[key, value]` 数组。

```javascript
// entries方法
for (let [key, value] of map.entries()) {
  console.log(key + '=' + value)
}
```

#### keys()：MapIterator

这个 keys 方法返回一个新的 Iterator 对象，它按插入顺序包含了 Map 对象中每个元素的键。

```javascript
for (const key of map.keys()) {
  console.log(key)
}
```

#### values()：MapIterator

这个 values 方法返回一个新的 Iterator 对象，它按插入顺序包含了 Map 对象中每个元素的值。

```javascript
for (const value of map.values()) {
  console.log(value)
}
```

#### forEach()

```javascript
map.forEach((value, key, map) => {
  console.log(value, key, map)
})
```

#### function Object() {[native code]}

Map 的构造函数可以将一个二维的键值对数组转化成一个 Map 对象

```javascript
let array = [
  ['key1', 'value1'],
  ['key2', 'value2', 'value3'],
]

let maps = new Map(array) //Map(2) { 'key1' => 'value1', 'key2' => 'value2' }
```

使用 Array.from 函数可以将一个 Map 对象转换成一个二维键值对数组

```javascript
varoutArray = Array.from(maps)
```

## Set

**set 的构造函数接收一个数组返回一个 Set 的实例化对象**

Set 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用。

\_Set 对象存储的值总是唯一的所以需要判断两个值是否相等 \_
_特殊情况的几个值需要另外判断_

- _+0 和 -0 在存储判断唯一性的时候是恒等的所以不重复_
- _undefined 与 undefined 是恒等的所以不重复_
- _NaN 与 NaN 是不恒等的在 Set 中只能存一个不重复_

```javascript
let set = new Set()

set.add(+0)
set.add(-0)
console.log(set) // Set(1) {0}

set.add(undefined)
set.add(undefined)
console.log(set) // Set(2) { 0, undefined }

set.add(NaN)
set.add(NaN)

console.log(set) // Set(3) { 0, undefined, NaN }
```

### 数组转 set

```javascript
var mySet = new Set(['value1', 'value2', 'value3'])
//Set(3) {'value1', 'value2', 'value3'}
```

### String 转 set

```javascript
new Set("hello")
Set(4) {
    'h',
    'e',
    'l',
    'o'
}
```

### set 转数组

```javascript
var mySet = new Set(['value1', 'value2', 'value3'])
//Set(3) {'value1', 'value2', 'value3'}
var mySetArray = [...mySet]
```

### Array 数组去重

```javascript
vat mySet = new Set([1, 2, 3, 4, 4, 4, 5])[...mySet] // [1,2,3,4,5]
```

### 求两个数组的并集

```javascript
var a = new Set([1, 2, 3, 4, 5, 6])
var b = new Set([1, 2, 3, 4, 5, 7, 8])
var c = new Set([...a, ...b])
// Set(8) { 1, 2, 3, 4, 5, 6, 7, 8 }
```

### 交集

```javascript
// 交集
var a = new Set([1, 2, 3, 4, 5, 6])
var b = new Set([1, 2, 3, 4, 5, 7, 8])

var c = new Set([...a].filter((x) => b.has(x)))

console.log(c) //Set(5) { 1, 2, 3, 4, 5 }
```

### 差集

```javascript
// 差集 即 a中有的元素 b没有
var a = new Set([1, 2, 3, 4, 5, 6])
var b = new Set([1, 2, 3, 4, 5, 7, 8])

var c = new Set([...a].filter((t) => !b.has(t))) //Set(1) { 6 }
console.log(c.size) // 1
```

### API

- add(value)：添加某个值，返回 Set 结构本身。
- delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
- has(value)：返回一个布尔值，表示该值是否为 Set 的成员。
- clear()：清除所有成员，没有返回值。

### 遍历

Set 内部的元素可以用 for...of 遍历。

### 转数组

- **Array.from() 方法可以将 Set 数据类型转化为数组类型。**
- **\[...set]**

### 去重

```javascript
var a = [1, 2, 3, 4, 5, 6]
var b = [1, 2, 3, 4, 5, 7, 8]

var c = a.concat(b)

var map = new Set(c)
console.log(map) // Set(8) { 1, 2, 3, 4, 5, 6, 7, 8 }
```

#### 对象去重

没想到什么好方法要么用 map 或者直接数组去重 🤣

## 文件导入

### 通过 `import assert` 导入文件

```js
import Icon from './icon.json'
assert {
    type: 'json'
}
```

### 通过 `fetch` 导入文件

```js
const data = await fetch('./src/article/data.json')
const list = await data.json() // 获取json数据
```

### 动态导入 json

```js
const path = './icon.json'

async function getJsonModule() {
  const jsonModule = await import(path, {
    assert: {
      type: 'json',
    },
  })
  return jsonModule
}
```

## class

### 对象的私有字段表示

添加 `#` 操作符表示私有字段

```typescript
class ClassWithPrivateField {
  #privateField
}
```

## FAQ

### 对于解构赋值的一些技巧

- 如果对象的属性为 null 是不能解构出来的

```javascript
let obj = {
  name: null,
}

const { name = 'name' } = obj

console.log(name) // null
```

经过 babel 转换的代码：

```javascript
'use strict'

var obj = {
  name: null,
}
var _obj$name = obj.name,
  name = _obj$name === void 0 ? 'name' : _obj$name
```

由此可得

```javascript
void 0 === undefined // true

null === undefined // false
```

即解构之后如果要赋值默认值则这个值得是 undefind

可以使用 **void 0** 代替 **undefined**

1. 使用 void 0 比使用 undefined 能够减少 3 个字节
2. undefined 并不是 javascript 中的保留字，我们可以使用 undefined 作为变量名字，然后给它赋值。void 0 输出唯一的结果 undefined，保证了不变性。

### 奇特的运算

```javascript
{} + "1" // 1  // {} 是一个代码块 相当于执行了 ({}); +1
[] + "1" // "1"
{} + [] // 0
[] + {} //'[object Object]'
```

### 命名规范

- `"get…"` —— 返回一个值，
- `"calc…"` —— 计算某些内容，
- `"create…"` —— 创建某些内容，
- `"check…"` —— 检查某些内容并返回 boolean 值，等。

函数名通常是动词

### 垃圾回收

typeof 操作符可以确定值的原始类型，而 instanceof 操作符用于确保值的引用类型。

主流的垃圾回收算法是标记清理，即先给当前不使用的值加上标记，再回来回收它们的内存。

### 严格模式

> 现代 JavaScript 支持 “class” 和 “module” —— 高级语言结构，它们会自动启用 use strict。因此，如果我们使用它们，则无需添加 “use strict” 指令。

```html
<!-- index.js 中会自动开始严格模式 -->
<script src="./index.js" type="module" />
```

### +0 与 -0

在 javascript 中 +0 与 -0 在大多数情况都是相等的

> 使用 `===` 也不例外

为了区别 `+0` 与 `-0` 有以下的方法：

- `Object.is`

- ```js
  # babal 的 pollify 的方式
  function strictlyEqualToZero(num1,num2) {
     return num1 === 0 && num1 === num2 && (1 / num1) !== (1 / num2)
  }
  ```

## 参考资料

- [现代 javascript 教程](https://zh.javascript.info/)
- [function toLocaleString() { [native code] } MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString#%E4%BD%BF%E7%94%A8_locales)

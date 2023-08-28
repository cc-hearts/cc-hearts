---
title: 装饰器（decorator）在ts的使用
date: 2023-07-17
articleId: 31632bcb-4700-48d9-b0a4-ad544cb35e41
---

## 前言

最近在使用 `nest` 写一些小应用，在开发过程中也使用了各式各样的装饰器（例如 `@inject` 、 `@UseInterceptors` 等）。并且 decorator 已经进入 ECMA 第三提案阶段，因此准备写一篇小作文，介绍一下 TypeScript 中 decorator 的语法使用。

## class decorator(类装饰器)

每日疑惑 🤔，为啥是 class decorator 而不是 function decorator ?

本着试一试的态度准备进行编码进行测试，然而还没写完就 ts 已经报出了错误： `Decorators are not valid here`

![image-20230718012101981](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-07-17/image-20230718012101981.png)

运行 `tsc` 看看编译之后的结果：

```js
function logger(_) {
  return 0
}

function User() {
  return {
    name: 'join',
  }
}
```

可以看出 在 function 上 使用 decorator 根本不会正确编译，于是只能在 class 上 使用 decorator，基本使用方法如下：

```ts
function logger(target: User) {
  // target的值就是User
  console.log(target)
}

@logger
class User {}
```

使用 tsc 对代码进行编译：

```js
var __decorate =
  // 通过调试发现一般this 都是undefined 因此都会走后续的逻辑
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    // 这里只传进来两个参数 [logger], User
    var c = arguments.length,
      // 因此r 就是 target 也就是 我们装饰的类 User
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d
    // 现提案还没有Reflect.decorate 这个API 因此走 else
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc)
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          // 因为 c < 3
          // 通后便利 decorators 不断的使得 r = d(r) || r
          // 因此 logger 装饰器的第一个参数 target 就是r(上述的 User赋值给了r)
          // 因此装饰器 logger 以及后续的装饰器 如果不返回一个 class 则 r 始终就是User
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
    // c < 3 的缘故 因此可以直接看成 return r
    return c > 3 && r && Object.defineProperty(target, key, r), r
  }

function logger(target) {
  console.log(target)
}
let User = class User {}
User = __decorate([logger], User)
```

从上述的运行结果来看 class decorator 的返回值可以是 falsy 或者是 class 。

那 ts 对 class decorator 的类型约束是 `falsy | class` 吗？

通过调试可知， ts 的类型约束装饰器的返回值必须为 `void | typeof User` 。

![image-20230717233855978](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-07-17/image-20230717233855978.png)

在上述的编译后的 js 代码可知，js runtime 时 `return falsy` 与 `return void 0` 的结果是一样的。使用 `@ts-ignore` 注释类型错误后， 使用 tsc 编译运行如下：

![image-20230718010110575](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-07-17/image-20230718010110575.png)

可以看到运行的结果依旧是 User 类本身的实例化对象。

`typeof User` - 说明返回值的类型需要是这个类本身或者是子类，一般而言返回的都是子类（返回类本身 和 返回 `void` 的结果一致 ），因为只有子类才能继承和扩展原始的类，在不改变原有的类的属性的基础上进行添加或修改属性和方法。

```ts
function logger(target: User) {
  // return class 替换 原有的class 操作
  return class extends target {
    constructor() {
      this.age = 1
    }
  }
}

@logger
class User {}

new User()
```

### class factory

ts 支持 class factory 的写法：

```ts
function logger(bool: boolean) {
  if (bool) {
    return function (target) {
      console.log('logger')
      return target
    }
  }
  return void 0
}

@logger(false)
class User {
  name: 'join'
}
```

将此 ts 代码使用 tsc 编译之后:

```js
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc)
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
    return c > 3 && r && Object.defineProperty(target, key, r), r
  }

function logger(bool) {
  if (bool) {
    return function (target) {
      console.log('logger')
      return target
    }
  }
  return void 0
}
let User = class User {
  constructor() {
    Object.defineProperty(this, 'name', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    })
  }
}
User = __decorate([logger(false)], User)
```

与第一次编译的例子对比可知，执行的变化部分在 decorate 的第一个参数的值，并且函数调用的方式与我们装饰器修饰的语法相似。

```diff
- User = __decorate([logger], User)
+ User = __decorate([logger(false)], User);
```

因此装饰器可以使用函数柯里化进行修饰：

```ts
function logger(bool: boolean) {
  if (bool) {
    return function (name: string) {
      return function (target) {
        return class extends target {
          constructor() {
            super()
            this.name = name
          }
        }
      }
    }
  }
  return function (_) {
    return void 0
  }
}

@logger(false)('new name')
class User {
  public name: string = 'join'
}

console.log(new User())
```

编译之后的 `__decorate` 函数：

```js
User = __decorate([logger(false)('new name')], User)
```

```js
r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
```

> 装饰器 `@xxx()()()` 会编译成 `xxx()()()` , 在入参的时候就已经优先调用将结果作为 `decorators` 的子项传入 `__decorate` 中，为了满足 `d(r)` 能够顺利运行， 因此 `xxx()()()` 的返回值必须是一个函数。

## methods decorator(方法装饰器)

首先拟定一个简单的方法装饰器的模版：

```ts
function logger() {
  console.log(arguments)
}

class User {
  name: string

  // @ts-ignore
  @logger
  getName() {
    return this.name
  }
}
```

通过 `tsc` 将代码编译后可得：

```js
// __decorate 的逻辑与上述的 class decorate 的逻辑一致
// 下面将看下 属性装饰器的传参的区别以及返回结果值的区别

// 属性装饰器会传入4个参数
// decorators 装饰器的队列
// prototype 类的显式原型链
// identifier 属性名称
// descriptor: 要定义或修改的属性的描述符。

// 这几个属性也对应了下面的四个参数
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    // c r d 连续声明
    var c = arguments.length,
      // r 属性的描述符 可以是一个 对象或者是 undefined (void 0)
      // 由于传入的值是一个null 因此会走 Object.getOwnPropertyDescriptor(target, key)
      // r的值会是当前属性的描述符
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc)
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          // 此时的 c 有四个值  > 3 因此会调用
          // d(target, key, desc)
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
    // 参数值 > 3 并且属性的描述符存在的话 返回 r
    return c > 3 && r && Object.defineProperty(target, key, r), r
  }
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    // 如果引入了 reflect-metadata 的库 设置 元数据
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v)
  }

function logger() {
  console.log(arguments)
}

class User {
  constructor() {
    Object.defineProperty(this, 'name', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    })
  }
  // @ts-ignore
  getName() {
    return this.name
  }
}
__decorate(
  [
    logger,
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  User.prototype,
  'getName',
  null
)
```

### reflect-metadata

> `Reflect.metadata` 是 ES7 的提案，现在还没有纳入正式的版本中，因此要使用第三方的库 `reflect-metadata` 提供的 API 设置元数据。

首先安装 `reflect-metadata` :

```shell
 $ pnpm i reflect-metadata
```

在 `__metadata` 这打断点调试一下 `Reflect.metadata` ,

通过断点往下步入, 可以看到 `Reflect.metadata` 函数的声明：

```js
// metadata 通过必包存储 key, value
function metadata(metadataKey, metadataValue) {
  function decorator(target, propertyKey) {
    if (!IsObject(target)) throw new TypeError()
    if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
      throw new TypeError()
    OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey)
  }
  return decorator
}

// O 就是当前class的 prototype P 就是声明的属性的名称
function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
  // 获取存储容器 下述会有 GetOrCreateMetadataMap 函数的解析
  var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true)
  // 设置值
  metadataMap.set(MetadataKey, MetadataValue)
}

// WeakMap 弱引用 可以防止内存泄漏
var Metadata = new _WeakMap()
// ...
function GetOrCreateMetadataMap(O, P, Create) {
  // 获取当前类的存储元数据的map集合
  var targetMetadata = Metadata.get(O)
  // 初始化过程 没有定义 targetMetadata根据 Create 字段值是否初始化targetMetadata
  if (IsUndefined(targetMetadata)) {
    if (!Create) return undefined
    targetMetadata = new _Map()
    Metadata.set(O, targetMetadata)
  }
  // 取出当前属性的map存储值 此时的metadataMap是用于存储装饰器设置key,value (e.g. "design:type", Function)
  var metadataMap = targetMetadata.get(P)
  // 如果没有存储的Map容器 初始化
  if (IsUndefined(metadataMap)) {
    if (!Create) return undefined
    metadataMap = new _Map()
    targetMetadata.set(P, metadataMap)
  }
  // 返回可以存储key,value的map容器
  return metadataMap
  // 这里相当于两层映射
  // 1. 通过 O 从 Metadata 获取存储类的Map(targetMetadata)
  // 2. 通过 P 从 targetMetadata 获取存储元数据的Map(metadataMap)
}
```

![image-20230720223143434](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-07-20/image-20230720223143434.png)

存储的元数据 可以使用 `Reflect.getMetadata` 获取：

```ts
Reflect.getMetadata('design:type', User.prototype, 'getName') === Function // true
```

## property decorator(属性装饰器)

属性装饰器有两种： `静态属性装饰器` 和 `实例属性装饰器` , 静态属性装饰器主要用于在 `static` 的属性上，而实例属性则作用于普通的属性字段上。🌰 如下所示：

> [typescript 中文文档 decorator](https://www.tslang.cn/docs/handbook/decorators.html): 属性描述符不会做为参数传入属性装饰器，这与 TypeScript 是如何初始化属性装饰器的有关。 因为目前没有办法在定义一个原型对象的成员时描述一个实例属性，并且没办法监视或修改一个属性的初始化方法。返回值也会被忽略。因此，属性描述符只能用来监视类中是否声明了某个名字的属性。

```ts
function logger() {
  console.log(arguments)
}

class User {
  @logger
  static pi: number = 3.14

  @logger
  x: number
}
```

编译的结果如下所示：

```js
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      // 这里是属性装饰器
      // 属性装饰器拿不到属性的描述符 因此desc会是 undefined(void 0)
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc)
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
    return c > 3 && r && Object.defineProperty(target, key, r), r
  }
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v)
  }
import 'reflect-metadata'

function logger() {
  console.log(arguments)
}
class User {
  constructor() {
    Object.defineProperty(this, 'x', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    })
  }
}
Object.defineProperty(User, 'pi', {
  enumerable: true,
  configurable: true,
  writable: true,
  value: 3.14,
})
__decorate(
  [logger, __metadata('design:type', Number)],
  User.prototype,
  'x',
  void 0
)
__decorate([logger, __metadata('design:type', Number)], User, 'pi', void 0)
```

从代码分析可知， 不同之处在于：

- 实例属性的 target 是 class 的 `prototype`。
- 静态属性的 target 是 class 本身。

并且属性装饰器接收到的参数的有效部分始终只有 target 和 key（第三个参数始终为 `void 0` ）

## accessor decorator(访问符装饰器)

与 方法装饰器的编辑结果相似 这里不多赘述。

## parameter decorator(参数装饰器)

参数装饰器的行为与 实例属性装饰器的行为相似。

举个 🌰：

```ts
function logger() {
  console.log(arguments)
}

class User {
  getData(
    // @ts-ignore
    @logger
    params: string
  ) {
    console.log(params)
  }
}
```

编译后为:

```js
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc)
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
    return c > 3 && r && Object.defineProperty(target, key, r), r
  }
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v)
  }
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      // decorator 就是我们声明的装饰器的函数
      decorator(target, key, paramIndex)
    }
  }

function logger() {
  console.log(arguments)
}
class User {
  getData(params) {
    console.log(params)
  }
}
__decorate(
  [
    __param(0, logger),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  User.prototype,
  'getData',
  null
)
```

对比源码可以看出 首先调用了 `__param` 的方法，用于缓存当前的参数的下标值。之后通过 `d(target, key, r)` 的调用会将 class 的 prototype 和 方法名传入装饰器函数中。

> 虽然这里的 `desc` 为 null 可以拿到 getData 的描述符，但是 `__param` 并没有接收这个参数，而是使用了参数的 `index` 下表替代这个参数传给了装饰器函数。

## 执行顺序

```ts
// @ts-ignore
@logger
class User {
  // @ts-ignore
  @logger
  age: number

  // @ts-ignore
  @logger
  static schema = 'schema'

  // @ts-ignore
  @logger
  get SchemaVal() {
    return User.schema + '__$1'
  }

  // @ts-ignore
  @logger
  getData(
    // @ts-ignore
    @logger
    params: string
  ) {
    console.log(params)
  }
}
```

编译之后的代码为：

```js
// 执行实例属性装饰器
__decorate(
  [logger, __metadata('design:type', Number)],
  User.prototype,
  'age',
  void 0
)
// 执行 访问器装饰器
__decorate(
  [
    logger,
    __metadata('design:type', Object),
    __metadata('design:paramtypes', []),
  ],
  User.prototype,
  'SchemaVal',
  null
)
// 执行方法装饰器
__decorate(
  [
    logger,
    __param(0, logger),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  User.prototype,
  'getData',
  null
)
// 执行静态属性装饰器
__decorate([logger, __metadata('design:type', Object)], User, 'schema', void 0)

// 执行类装饰器
User = User_1 = __decorate([logger], User)
```

因此装饰器的执行顺序为：

实例属性装饰器 => 访问器装饰器 => 方法装饰器 => 静态属性装饰器 => 类装饰器

## 小结

- class decorate： `class decorate` 的本质是收集 `decorators` 并对类进行修改（如果 `decorator` 有返回值并且返回值为 truly ， 会替换原有的类）。无论装饰器有多少次柯里化调用（ `@xxx()()()` ），最后的一次返回值都需要是一个函数。

- methods decorate： `methods decorate` 主要用于对属性的描述符的修改以及通过使用 `reflect-metadata` 对元数据进行封装

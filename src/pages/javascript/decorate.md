---
title: 装饰器（decorator）在ts的使用 - (正在更新)
---

## 前言

最近在使用 `nest` 写一些小应用，在开发过程中也使用了各式各样的装饰器（例如 `@inject` 、 `@UseInterceptors` 等）。并且 decorator 已经进入 ECMA 第三提案阶段，因此准备写一篇小作文，介绍一下 TypeScript 中 decorator 的语法使用。

## class decorator

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
    function(decorators, target, key, desc) {
        // 这里只传进来两个参数 [logger], User
        var c = arguments.length,
            // 因此r 就是 target 也就是 我们装饰的类 User
            r =
            c < 3 ?
            target :
            desc === null ?
            (desc = Object.getOwnPropertyDescriptor(target, key)) :
            desc,
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
                    // 因此 装饰器 logger 以及后续的装饰器 如果不返回一个 class 则 r 始终就是User
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

`void` - 在上述的编译后的 js 代码可知，js runtime 时 `return falsy` 与 `return void 0` 的结果是一样的。使用 `@ts-ignore` 注释类型错误后， 使用 tsc 编译运行如下：

![image-20230718010110575](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-07-17/image-20230718010110575.png)

可以看到运行的结果依旧是 User 类本身的实例化对象。

`typeof User` - 说明返回值的类型需要是这个类本身或者是子类，一般而言返回的都是子类（返回类本身 和 返回 `void` 一致 ），因为只有子类才能继承和扩展原始的类，在不改变原有的类的属性的基础上进行添加或修改属性和方法。

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

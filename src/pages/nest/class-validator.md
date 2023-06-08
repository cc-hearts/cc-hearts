---
title: class-validator 基础api介绍
---

## 基本使用

```ts
import {
  Contains,
  IsNotEmpty,
  IsOptional, // 验证参数是否是`null` 或者是`undefined` 如果条件为 `true` 忽略该属性的所有验证器
  validate,
  IsInt,
  Length,
  Max,
  Min,
  MinLength,
  MaxLength,
  ValidateNested, // 验证是否是数组或者对象的验证器
  ValidatePromise, // 验证Promise
} from 'class-validator'
```

```ts
import { IsNotEmpty, validate } from 'class-validator'

export class UserDto {
  @IsNotEmpty({ message: 'name 不允许为空' })
  name: string
  @IsNotEmpty({ message: 'code 不允许为空' })
  code: string

  @MaxLength(20, {
    // each 表示的是一个数组 set map等可迭代结构
    each: true,
  })
  tags: string[]
}

const data = new UserDto()
data.name = 'cc-heart'

/**
 * [
 * ValidationError {
 *   target: UserDto { name: 'cc-heart', code: undefined },
 *   value: undefined,
 *   property: 'code',
 *   children: [],
 *   constraints: { isNotEmpty: 'code 不允许为空' }
 * }]
 */
validate(data).then((err) => {
  console.log(err)
})
```

## 案例：

1. 允许 `null` 但是不允许 `undefined`

```ts
@IsString()
// 条件为false 时 所有的验证器都会被忽略
// @see: https://github.com/typestack/class-validator#conditional-validation
@ValidateIf((object,data) => object !== null)
name: string | null
```

## 在 nest 中使用

> 可能会有疑问，为啥在 nest 中使用 Dto 字段标注一下就能获取到类型的?
> 答案是 通过`reflect-metadata` 去反射获取类型注视的类

```ts
class User {
  // @ts-ignore
  getData(@getValidateDto() user: UserDto) {
    return user;
  }
}

function getValidateDto() {
  return function (target, propertyKey) {
    const typeClass = Reflect.getMetadata("design:paramtypes", target, propertyKey);
    console.log(typeClass) // UserDto
  }
}

## 参考资料

- [validation decorators](https://github.com/typestack/class-validator#validation-decorators)
- <https://github.com/typestack/class-validator#class-validator>
- [一个参数验证，学会 Nest.js 的两大机制：Pipe、ExceptionFilter](https://juejin.cn/post/7046357088070696997)
- [metaData](https://www.tslang.cn/docs/handbook/decorators.html#metadata)
- [nestJs validation](https://docs.nestjs.com/techniques/validation)
```

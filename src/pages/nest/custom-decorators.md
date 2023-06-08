---
title: 自定义装饰器
---

## createParamDecorator

nest 提供的参数装饰器`createParamDecorator<T>(data: T, ctx: ExecutionContext)`

> 获取 用户信息的装饰器写法:

```ts
export const Profile = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})
```

在`controller` 中 即可使用`@Profile` 装饰器去获取用户信息

> request.user 需要在`Guard` `Interceptor` 等 方法执行之前注入到 `request` 中 才能在装饰器中获取

```ts
 @ApiOperation({ summary: '退出登陆' })
  @Get('/logout')
  logout(@Profile() profile) {
    return this.userService.logout(profile.id);
  }
```

## 使用 pipe

🍭

## 装饰器组合

nest 提供了 装饰器的组合 API:`applyDecorators`

官方鉴权的例子:

```ts
import { applyDecorators } from '@nestjs/common'

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' })
  )
}
```

## 案例 白名单装饰器

```ts
import type { cb } from '../typings'

const set = new WeakSet<cb>()

/**
 * 白名单鉴权
 */
export const WhitePath = () => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    set.add(descriptor.value)
  }
}

export function isExistWhitePath(func: cb) {
  return set.has(func)
}
```

在需要添加白名单的接口上使用

```ts
  @WhitePath()
  @ApiOperation({ summary: '注册用户' })
  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
```

之后可以在`Guard`中进行白名单校验

```ts
// getHandler 找到当前执行的controller的方法
const func = context.getHandler() as cb
// 白名单过滤
if (isExistWhitePath(func)) {
  return true
}
```

## 参考资料

- [nestJs docs custom-decorators](https://docs.nestjs.com/custom-decorators)

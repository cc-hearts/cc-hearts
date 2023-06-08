---
title: Guard 守卫
---

> 守卫其实也是中间件其中的一种，只是在 NestJs 中对中间件更加具体的划分，将不同职能的部件给了不同的称呼，一般守卫是用来做登录鉴权等权限类的校验

> 守卫会在所有的中间件之后执行 在所有的拦截器以及管道之前会执行

守卫也是使用的是`@Injectable` 修饰 并且实现了 `CanActivate` 接口 并且需要返回值

> 不管是`Promise` 还是管道 都需要返回一个`boolean` 对象值

```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { RedisService } from '../provider/redis.provider'
import { decrypt } from '../utils/crypto'
import { isExistWhitePath } from '../decorators/whitePath'
import type { cb } from '../typings'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise(async (resolve) => {
      const func = context.getHandler() as cb
      // 白名单过滤
      if (isExistWhitePath(func)) {
        resolve(true)
        return
      }
      const request = context.switchToHttp().getRequest()

      let token: string = request.headers['authorization']?.split(' ')[1]
      token = decrypt(token).split('/')[1]

      if (!token) {
        resolve(false)
      }

      const user = await this.redisService.get(token)
      const isExist = !!user
      if (isExist && typeof user === 'string') {
        request.user = JSON.parse(user)
      }
      resolve(isExist)
      return
    })
  }
}
```

## 作用位置

> 守卫可用于`全局守卫`、`控制器守卫`

### 全局守卫

在`main.ts`注册即可

```ts
app.useGlobalGuards(new AuthGuard(app.get(RedisService)))
```

## 控制器守卫

可以给单独的`Controller` 添加守卫

```ts
@UseGuards(RolesGuard)
// 可以传递依赖的类 交给框架去实例化对象 也可以自己手动实例化对象
// @Useaguards(new RolesGuard())
export class CatsController {}
```

## 守卫的`Provider`

```ts
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

## jwt 和 token + redis 的区别

- jwt 是将用户信息加密到一个字符串中 服务端可以解密
- token+redis 方案
  1. 使用一些算法生成一个 token 当做然 ey 来存储到 redis 中，值为当前用户信息（用户 id,用户名等）
  2. 这里简单使用 uuid 生成 token
  3. 根据前端传递的 token(uuid)从 redis 中读取数据，获取用户信息
     > token + redis 可以跨语言使用

## 参考资料

- [nest guard docs](https://docs.nestjs.com/guards#guards)
- [nestjs[一例看懂中间件、守卫、管道、异常过滤器、拦截器]](https://blog.csdn.net/lxy869718069/article/details/103960790)

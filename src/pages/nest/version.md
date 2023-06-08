---
title: 版本控制
---

# 版本控制

一般的开发规范

> 域名/api（前缀）/版本号/项目名称/控制器/方法

```ts
import { VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // 添加全局的版本控制
  app.enableVersioning({
    type: VersioningType.URI,
  })
  await app.listen(3000)
}
bootstrap()
```

除了全局的版本 控制 也可以在`controller` 上添加版本控制

```ts
@Controller({
  path: 'user',
  version: '1',
})
```

或者在指定的方法上加版本控制

```ts
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Version('2')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  // 如果不关心版本 可以直接使用VERSION_NEUTRAL
  @Version([VERSION_NEUTRAL, '1'])
  findAll() {
    return this.userService.findAll()
  }
}
```

> `VERSION_NEUTRAL` 用于无视版本

最后一种`URI`的方式就是在中间件中添加版本控制

```ts
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(loggerMiddle)
      // version 可以进行版本的控制
      .forRoutes({ path: 'user', method: RequestMethod.GET, version: '3' })
  }
}
//由于地层依赖的是express 这里接收的参数和express 的router是一致的
function loggerMiddle(req, res, next) {
  console.log(req.path)
  res.send(200)
  next()
}
```

## 参考资料

- [nest docs Versioning](https://docs.nestjs.com/techniques/versioning#versioning)

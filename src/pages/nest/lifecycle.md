---
title: 生命周期
---

## 模块初始化 hook

`onModuleInit` 用于在模块创建的时期初始化一些配置(例如： 连接`redis`)

```ts
@Injectable()
export class RedisService {
  private redisInstance: Redis

  onModuleInit() {
    if (!this.redisInstance) {
      this.createInstance()
    }
  }

  createInstance() {
    const { redis: redisConfig } = getConfig()
    this.redisInstance = new Redis(redisConfig)
  }
}
```

## 参考资料

- [nestJs docs Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events#lifecycle-sequence)

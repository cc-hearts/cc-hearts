---
title: cache 缓存模块
---

## Redis 缓存

`cache-manager` 可以使用 redis 缓存
先安装对应的包

```ts
 pnpm add cache-manager-redis-store redis
```

> `cache-manager-redis-store: 3.0.1` `redis: 4.5.1` 版本进行的 code

先在`app.module` 中 注册 缓存模块

```ts
// 开启全局缓存配置
CacheModule.registerAsync<ClientOpts>({
  isGlobal: true,
  useFactory: async () => {
    const store = await redisStore({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      db: redisConfig.db,
      password: redisConfig.password,
    })
    return {
      store: store,
      // 设置缓存的时间
      ttl: 60 * 60 * 24 * 7,
    }
  },
})
```

### set 方法

```ts
const response = await getAppToken()
appToken = response.tenant_access_token
await this.cacheManager.set(this.APP_TOKEN_CACHE_KEY, appToken, {
  // 设置缓存的过期时间
  ttl: response.expire - 60,
})
```

### get 方法

get 方法 没有啥改变 正常调用即可

```ts
appToken = await this.cacheManager.get(this.APP_TOKEN_CACHE_KEY)
```

## 使用 缓存拦截器

> 缓存拦截器可以使用在`get` 请求上 这样可以走`协商缓存`

```ts
  @Get('api')
  @CacheTTL(10) // 缓存时间
  @UseInterceptors(CacheInterceptor)
  getHello(): { cache: string } {
    return { cache: 'cache' };
  }
```

## 参考资料

- [nest docs caching](https://docs.nestjs.com/techniques/caching)

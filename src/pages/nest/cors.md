---
title: 跨域配置
---

```ts
// 允许跨域
app.enableCors()
//或者
const app = await NestFactory.create(AppModule, { cors: true })
```

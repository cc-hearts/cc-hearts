---
title: 跨域配置
date: 2023-02-11
---

```ts
// 允许跨域
app.enableCors()
//或者
const app = await NestFactory.create(AppModule, { cors: true })
```

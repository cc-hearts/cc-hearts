---
title: 前缀基本使用
date: 2022-12-19
---

# 前缀基本的使用

## 全局前缀的添加

可以使用`setGlobalPrefix` 添加全局的`URI`前缀

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix(prefix)
}

bootstrap()
```

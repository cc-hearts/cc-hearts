---
title: nest 流程
---

## nest 流程

执行的流程：

发起的请求 ==> 中间件 ==> 守卫 ==> 拦截器(next.handle() 之前) ==> 管道 ==> 执行对应的 Controller 方法 ==> 拦截器(next.handle() 之后) ==> 请求结束 返回内容

> 这里中间件 ==> 到拦截器中的所有的异常 都可以被异常过滤器捕获

![nest-progress](http://oss.cc-heart.cn:30002/oss/file/WPJTOOANlAvXos4EJeb0m/2023-06-07/nest-progress.png)

## 文档资料

- [nest 中文文档](https://www.kancloud.cn/juukee/nestjs/2666734)

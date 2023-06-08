---
title: 静态资源配置
---

## 基于 Express

如果`Nest` 是基于`Express` 作为底层 则可以直接使用`useStaticAssets` 设置静态资源的文件位置

在`main.ts` 中配置

```ts
const { port, folder_name } = getConfig()
app.useStaticAssets(join(__dirname, '..', '..', folder_name), {
  prefix: `/oss/${folder_name}/`,
}) // 所有URL访问了 /oss/${folder_name} 都会被转义 例如:
// /oss/file/WPJTOOANlAvXos4EJeb0m/2023-04-16/Snip20161117_6-20230416221122138.png
// 最后请求的是服务器上的 join(__dirname, '..', '..', folder_name) 下的  WPJTOOANlAvXos4EJeb0m/2023-04-16/Snip20161117_6-20230416221122138.png的文件
```

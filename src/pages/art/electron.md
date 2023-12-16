---
title: electron 入门开发
date: 2023-12-11
articleId: 25829529-cf02-4c14-a32f-c25bee021093
---

# electron 入门

## FAQ

### electron install 出现 `Electron failed to install correctly`

报错信息一般如下

```shell
Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
```

解决方法：

进入 `node_modules` 中的 `electron` 包，运行 `node install` 安装 `electron` 的包

> 如果 install 失败，可以试试国内的镜像

```shell
registry="https://registry.npmmirror.com"
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
```

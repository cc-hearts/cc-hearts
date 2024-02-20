---
title: vscode 调试技巧
date: 2024-02-13
articleId: aeffd62c-9efe-4600-967e-12fc76c4a53c
---

# vscode 调试技巧

## FAQ

调试出现 `Can't find Node.js binary "node": path does not exist. Make sure Node.js is installed and in your PATH, or set the "runtimeExecutable" in your launch.json` 错误。

通过配置 `runtimeExecutable` 解决：

- 使用 `which npm` 找到 `npm` 的安装路径
- 添加配置项：`"runtimeExecutable": "${your_npm_path}"`

---
title: vscode vue2 debugger 配置文件参数
---

```json
{
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}",
      // 设置为 ture 会使用浏览器默认的存储数据的文件夹启动
      // 设置为false会使用默认的数据存储的文件夹
      "userDataDir": true,
      // stable canary 调试时候启动的浏览器
      "runtimeExecutable": "canary",
      // 运行时启动的参数
      "runtimeArgs": [
        "--auto-open-devtools-for-tabs ", // 自动打开调试面板
        "incognito", // 无痕模式/隐身模式 预览
      ],
      // 是否支持sourceMap映射
      "sourceMaps": true,
      // sourcemap 到的文件路径在本地里找不到，这时候代码就只读了
      // 将源码的路径映射到本地的路径
      "sourceMapPathOverrides": {
        "meteor://💻app/*": "${workspaceFolder}/*",
        "webpack:///./~/*": "${workspaceFolder}/node_modules/*",
        // 如果后续有hash 映射 可以使用 ??:* 去除hash映射
        "webpack://?:*/*": "${workspaceFolder}/*"
      }
    }
  ]
}
```

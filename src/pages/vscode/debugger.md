---
title: Visual Studio Code Debugger
date: 2023-05-12
---

`launch config`

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
        "--disable-web-security", // close CORS
        "--auto-open-devtools-for-tabs ", // 自动打开调试面板
        "incognito" // 无痕模式/隐身模式 预览
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

`attach config`

```json
{
  "name": "Attach to Chrome",
  // 指定浏览器提供调试的端口号
  // 需要与 --remote-debugging-port 端口对应
  "port": 9222,
  "request": "attach",
  "type": "chrome",
  "webRoot": "${workspaceFolder}"
}
```

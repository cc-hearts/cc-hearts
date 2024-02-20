---
title: mac 常用脚本
date: 2024-01-22
articleId: 612d7e12-949a-48b5-8fd0-975cf4af66b3
---

# mac 常用脚本

## 启动 Google Canary

> dir 地址需要更换

```shell
#! /bin/bash
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --remote-debugging-port=9222 --user-data-dir=/Users/heart/chrome-debugger --disable-web-security
```

## 启动 Google

```shell
#! /bin/bash
open -a "/Applications/Google Chrome.app" --args --disable-web-security  --user-data-dir=/Users/heart/google-disable-security
```

## 快速操作

1. 打开自动操作 app
2. 选择快速操作搜索为 `shell`

   1. 工作流程收到当前 `文件或文件夹`

   2. 位于 `访达`

   3. 选择 `变量` 双击 `选择运行shell脚本`

   4. 填入相关的 shell 脚本的指令

```bash
  for f in "$@"
  do
   echo "$f"
   cd "$f"
   /usr/local/bin/code
  done
```

## 清除启动台无效图标

```shell
defaults write com.apple.dock ResetLaunchPad -bool true

killall Dock
```

## 打开 vscode Insiders

```shell
#!/bin/bash

open -a "/Applications/Visual Studio Code - Insiders.app" ./

exit 0
```

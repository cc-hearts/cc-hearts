---
title: process 模块
date: 2024-01-23
articleId: b33daeef-3570-4289-a603-af588bd421c8
---

# process

在 Node.js 中，process 是一个全局对象，它提供了与当前 Node.js 进程相关的信息和控制。

## process.env

一个包含用户环境信息的对象。可以用它来访问环境变量。

最常见的就是使用 `NODE_ENV` 来确定当前应用所运行的环境。

除此之外，还有一些常用的环境变量：

- `process.argv`：一个包含命令行参数的数组。第一个元素是 Node.js 的执行路径，第二个元素是当前执行的 JavaScript 文件的路径，其余元素是命令行参数。
- `process.cwd()`：返回当前工作目录的路径。
- `process.exit(code)`：用于退出 Node.js 进程。code 参数是退出时的状态码，0 表示成功，非零表示错误。
- `process.env`：一个包含用户环境信息的对象。可以用它来访问环境变量。
- `process.env.tz`：一个 Node.js 中的环境变量，用于指定当前的时区。

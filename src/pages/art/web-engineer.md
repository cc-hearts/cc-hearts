---
title: 前端工程化
date: 2023-08-07
articleId: 810dee2e-1457-41cc-869e-1fa454095690
---

本章记录一下前端工程化常用的一些方案

## git hook 和 husky

`git hook` 可以让我们在 git 命令执行的前后运行脚本。 例如 `pre-commit` 这个 hook，可以在 `git commit` 执行前进行一段脚本，如果脚本运行失败（exit 1），则 `git commit` 不会提交。

`git hook` 是 sh 脚本，并且存在于 `.git/hook` 目录下。 这会导致一个问题： .git 目录下的文件是不会被提交的。

为了解决这一问题， 便有了用于管理 `git hook` 的 npm 工具 `husky` 。

### husky 安装

```shell
pnpm i husky --save-dev
```

### husky 的使用

安装完 `husky` 之后 需要运行 husky 的命令行工具，以设置 `git hook` 的路径为 `.husky` 。

```shell
npx husky install

# git config --local --list 可以看到 core.hookspath 被指定为了 husky
# core.hookspath=.husky
```

> 可以设置 npm 的 `prepare` 命令中，这样每次在执行 `npm install` 执行成功后执行 `prepare` 命令。

```shell
npm pkg set scripts.prepare="husky install"
```

添加 `pre-commit` hook，在每次 commit 之前格式化代码 & 运行单元测试

```shell
npx husky add .husky/pre-commit "npm test && npx lint-staged"
```

> `lint-staged` 是一个在 git 暂存文件上运行 linters 的工具。
> 你可以在 `package.json` | `.lintstagedrc.yml` | `.lintstagedrc.json` | `lint-staged.config.js` 中配置规则

`package.json` 的 🌰 如下：

```json
  "lint-staged": {
    "*.{vue,js,ts,jsx,tsx,json}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{md}": "prettier --write"
  }
```

`lint-staged.config.js` 的 🌰 如下：

```js
module.exports = {
  '*.js': (files) => {
    const filterFiles = files
      .filter((file) => file.includes('index.js'))
      .map((file) => `"${file}"`)
      .join(' ')
    return `npx eslint --fix ${filterFiles}`
  },
}
```

## husky 取消检验

```shell
git commit -m "test" --no-verify
```

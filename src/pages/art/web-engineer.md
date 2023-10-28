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

### husky 取消检验

```shell
git commit -m "test" --no-verify
```

## commitizen

commitizen 可以用于规范 git commit 的格式，在 `git log` 、`code review` 、` changlog` 等情况时， 良好的 commit 规范就会显得尤为重要

```shell
pnpm i commitizen --save-dev
```

### 适配器

根据项目的构建方式的不同，commitizen 可以支持不同适配器的扩展。本文会使用 `cz-conventional-changelog` 作为构建标准

安装命令如下：

```shell
npx commitizen init cz-conventional-changelog --save-dev --save-exact
```

> 如果使用 pnpm 下载的 node_module 可能会构建失败，此时可以使用 `pnpx commitizen init cz-conventional-changelog --pnpm -D` 初始化 (通过在 `commitizen init` 命令中使用 `--pnpm` 标志，你告诉 Commitizen 使用 PNPM 来安装和管理相关的依赖项)

运行命令后会在 package.json 中生成：

```json
"config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
```

之后便可以使用 `git cz` 来规范化 commit 格式

![image-20230924115343805](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-09-24/image-20230924115343805.png)

## conventional-changelog-cli

`conventional-changelog-cli` 是一个命令行工具，它用于生成符合约定式提交（Conventional Commits）规范的变更日志（changelog）。

```shell
pnpm i conventional-changelog conventional-changelog-cli --save-dev
```

之后便可以使用命令生成 `CHANGELOG`

```shell
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

`-p angular` 指的是使用 angular 的 git commit 标准，除此之外相关的还有 `conventional-changelog-gitmoji-config`

`-i CHANGELOG.md` 表示从 `CHANGELOG.md` 读取 changelog

`-s` 表示读写 changelog 为同一文件

`-r` 表示生成 changelog 所需要使用的 release 版本数量，默认为 1，全部则是 0

## 参考文章

- <https://juejin.cn/post/6844903700574502919?searchId=20230924001247E159AFC70A328BA2BC0C#heading-8>

- <https://zhuanlan.zhihu.com/p/51894196>

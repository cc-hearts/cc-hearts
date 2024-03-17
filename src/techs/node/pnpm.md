---
title: pnpm 基本使用
date: 2023-12-26
articleId: babd2227-d9e6-4542-b9f3-163ecb08e035
---

# pnpm 基本使用

`pnpm` 是 `node` 众多的包管理器的一种，相较于 `npm`，它的优势有：

- 节省磁盘空间，对于重复安装的依赖，只会在磁盘上安装一次。
- 避免幽灵依赖。
- 更加友好的支持 `monorepo` 的工程结构。

## 启用 monorepo

1. 创建 `pnpm-workspace.yaml` 文件。

2. 写入对应的配置，`packages` 属性用于指定 `monorepo` 的文件路径：

```yaml
packages:
  - 'packages/**'
  - 'scripts/**'
```

启用 `monorepo` 后，对于依赖的安装也会稍有不同。

例如，像 `prettier`、`husky` 这种只需在根目录安装的依赖，安装时需要添加 `-w` 参数使其安装到根目录的依赖下。

```shell
pnpm install typescript prettier husky -d -w
```

如果是安装局部依赖，则需要使用 `--filter` 去限制特定的子集。

> `-F` 也等价于 `--filter`

```shell
pnpm --filter @packages/utils add axios

# 卸载依赖
pnpm --filter @packages/utils remove axios
```

在 `monorepo` 的开发模式下避免不了各个 package 之间的相互引用。

例如 `@package/utils` 会被 `@package/compile` 和 `@package/ui` 这两个 package 所依赖，因此可以使用如下命令安装：

```shell
pnpm i @package/utils -r --filter @package/compile @package/ui
```

## link

在开发交互式的命令行工具时，使用 `pnpm link` 将依赖链接到项目中，以便在调试和测试过程中进行实时的修改和观察。

```shell
pnpm link --global # 将当前的包 link 到全局中
```

至此，在其他的 package 中，可以使用 link 的方式将 package 引入。

```shell
pnpm link --global <package-name>
# pnpm link --global @cc-heart/gen-index-export
```

测试完成后，使用 `unlink` 即可解除绑定。

```shell
pnpm unlink --global <package-name>
```

> 注意：`pnpm unlink` 与 `pnpm rm` 都是 `pnpm uninstall` 的别名

## 常用命令

```shell
pnpm why <package-name> -r # 列出这个包的源码位置，被 monorepo 内部哪些项目引用
```

卸载 package

```shell
pnpm rm --global <package-name>
# pnpm rm --global @cc-heart/gen-index-export
```

安装深层依赖

```shell
pnpm config set auto-install-peers true
```

运行所有子包的 `build` 命令

通过 `-r` 这个选项，递归遍历 `workspace` 模式下的子包并且运行相应的脚本，例如：

```shell
pnpm -r run build # 运行所有子包下 scripts 中的 build 命令
```

## 参考资料

- [pnpm -r](https://pnpm.io/cli/recursive)
- [pnpm 文档](https://pnpm.io/)
- [pnpm 使用](https://zhuanlan.zhihu.com/p/422740629)

---
title: node常用第三方库
date: 2023-07-25
articleId: e7050221-06f5-4c92-9c36-1d624ba4ab7b
---

# node 常用第三方库

## commander

`commander` 是一个用于解析命令行参数的 Node.js 库，它提供了一种简单的方式来定义和解析命令行选项和参数。

举个 🌰：

```ts
import { Command } from 'commander'
const program = new Command()

function initHelp() {
  const { version } = getPackage()
  program
    .name('gen-index-export')
    .version(version, '-v, --version')
    .usage('[options]')
    .option('-o, --output [type...]', 'output file path')
    .option('-p, --path [type...]', 'watch file path')
    .option('--recursive', 'watch file is recursive')
    .option('--ignoreIndexPath', 'ignore watch index file')

  program.parse()
}

// 通过 opts 获取命令行的参数值
const options = program.opts()
// code ...
```

## ora

`ora` 是一个用于在终端上显示加载动画的 Node.js 库，它提供了一种简单的方式来为长时间运行的任务添加动画效果。

🌰 如下：

```ts
import ora, { Ora } from 'ora'

let spinner: Ora | null = null
function loading(message?: string) {
  spinner = ora(message || 'The export file is being generated... \n').start()
}
function loadEnd(message?: string) {
  spinner?.succeed(message || 'The export file is generated successfully.')
}
async function generatorExportFile() {
  loading()
  await new Promise((resolve) => setTimeout(resolve, 3000))
  loadEnd()
}

// 运行 generatorExportFile 可以在终端看到 loading 效果
```

![image-20230729153448989](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-07-29/image-20230729153448989.png)

![image-20230729153507981](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-07-29/image-20230729153507981.png)

## rimraf

`rimraf` 是一个用于删除文件和文件夹的 Node.js 库，它提供了一种简单的方式来删除文件和文件夹，包括嵌套的目录和文件。

```js
import { rimraf } from 'rimraf'

// 删除一个文件
rimraf('file.txt', (err) => {
  if (err) {
    console.error(err)
  } else {
    console.log('File deleted')
  }
})

// 删除一个目录
rimraf('dir', (err) => {
  if (err) {
    console.error(err)
  } else {
    console.log('Directory deleted')
  }
})

// 同时 rimraf 提供了同步删除的方法
// const { rimrafSync } from 'rimraf'
```

## chalk

`chalk` 是一个用于在终端上添加颜色和样式的 Node.js 库，它提供了一种简单的方式来为命令行输出添加样式和颜色，提高用户体验。

```js
import chalk from 'chalk'
// 输出红色文本
console.log(chalk.red('Error!'))

// 输出绿色文本
console.log(chalk.green('Success!'))

// 输出带样式的文本
console.log(chalk.bold.underline('This is bold and underlined text'))

// 输出多种颜色和样式的文本
console.log(chalk.red.bold.underline('Error with multiple styles'))
```

![image-20230729155001055](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-07-29/image-20230729155001055.png)

## globby

`globby` 是基于 `glob` 的一个高级文件匹配库，它提供了更多的功能和选项来匹配文件路径和文件名，包括排除文件、忽略文件、扩展名匹配等。

```js
import { globby } from 'globby'
// 查找所有.js文件
globby('*.js')
  .then((files) => {
    console.log(files)
  })
  .catch((err) => {
    console.error(err)
  })

// 查找所有.txt文件（包括子目录），但排除node_modules目录
globby(['**/*.txt', '!node_modules/**'])
  .then((files) => {
    console.log(files)
  })
  .catch((err) => {
    console.error(err)
  })

// 使用忽略文件进行匹配
globby('**/*', {
  ignore: ['.gitignore'],
})
  .then((files) => {
    console.log(files)
  })
  .catch((err) => {
    console.error(err)
  })
```

## volta

`Volta` 是一个命令行工具，用于管理 JavaScript 的命令行工具。它的目标是让每个在项目上工作的开发人员无缝地安装相同的工具和版本。`Volta` 可以帮助你选择 Node.js 引擎，并且停止担心它。你可以在项目之间切换，而不必手动切换 Node.js 版本。

安装 `Volta`

```bash
curl https://get.volta.sh | bash
```

安装完成后，可以通过 `node@version` 安装确定的 node 版本号

```shell
volta install node@14.12.0
```

要将 Volta 设置为始终加载项目的特定版本的 Node.js，可以使用 pin 命令：

```shell
volta pin node@14.12.0
```

> `volta pin` 用于将特定版本的 Node.js 或包管理器固定到项目中。这意味着当你进入项目目录时，Volta 将自动使用你固定的版本，而不是默认的全局版本。

除此之外，可以在 `package.json` 中指定 `volta`，使其与项目的其他配置一起进行版本控制。这有助于确保配置信息与代码一起进行跟踪和管理。

```json
{
  "volta": {
    "node": "14.20.0",
    "yarn": "1.22.19"
  }
}
```

## 参考资料

[commander docs](https://github.com/tj/commander.js)

[ora docs](https://www.npmjs.com/package/ora)

[rimraf docs](https://www.npmjs.com/package/rimraf)

[chalk docs](https://www.npmjs.com/package/chalk)

[globby docs](https://www.npmjs.com/package/globby)

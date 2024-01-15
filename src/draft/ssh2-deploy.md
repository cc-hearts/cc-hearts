---
title: 基于 SSH2 实现本地打包部署
date: 2024-01-15
articleId: 142efacb-3869-4671-b63a-cb2cc5da5592
---

# 基于 SSH2 实现本地打包部署

在项目初期，还没有搭建工作流服务器的开发环境中，前端部署就将会成为一个繁杂的工作。需要本地先构建并压缩成资源包，再通过命令行或者 `GUI` 工具上传到服务器，并解压到 `nginx` 等服务器代理的指定的目录地址，才算完成一套最简易的部署流程。

本文将基于 `node` 的 `SSH2` 包实现一套本地编译部署工作流脚本。

> 本文主要以文件覆盖的形式作为上传，打包成 `tar.gz` 上传的方式后续会补充。

## 准备工作

首先，安装后续开发所需的依赖：

```shell
pnpm ssh2 chalk glob yaml --save-dev
```

1. 创建部署脚本 (这里命名为 `workflows-deploy.mts`)

```shell
touch workflows-deploy.mts
```

实现思路大致如下：

- 运行 `pnpm build` 对前端项目进行构建。(当然，如果需要运行单测等，可以先在这前面运行)

- 使用 SSH2 连接服务器

- 将本地构建文件上传到指定目录 (如果是 `nginx` 代理的项目，则上传到指定的代理目录即可)

## 编写远程部署脚本

依据上述的实现思路，可以优先确定需要配置的参数，如下：

```ts
interface Config {
  /**
   * 远程服务器地址
   */
  host: string
  /**
   * SSH 端口
   */
  port: number
  /**
   * 远程服务器用户名
   */
  username: string
  /**
   * 远程服务器密码
   */
  password: string
  /**
   * 远程服务器部署的路径
   */
  remotePath: string
  /**
   * 本地打包路径
   */
  distDir: string
}
```

接下来，使用 `SSH2` 这个包来实现连接服务器。
简易的代码如下：

```ts
import { Client } from 'ssh2'
import chalk from 'chalk'

const conn = new Client()
conn.on('ready', () => {
  console.log(chalk.green('ready status'))

  conn.sftp(async (err, sftp) => {
    console.log(chalk.green('SFTP connection successful'))
    // TODO: ...
  })
})

// 这里的config 就是上面 interface Config 的实例
conn.connect(config)
```

`sftp` 连接工作已经完成，接下来就是加载配置文件，这里使用 `yaml` 来编写配置文件，配置文件的模版如下所示：

```yaml
Config:
  host: ''
  port: 22
  username: 'root'
  password: '123456'
  remotePath: '/opt/fe-web'
  distDir: './dist'
```

使用 `yaml` 包加载配置文件。
这里定义配置文件的名称为 `application.yaml`

```ts
async function loadConfig() {
  const configStr = await readFile(resolve(_cwd, './application.yaml'), 'utf-8')
  return yaml.parse(configStr) as Config
}
```

接下来实现部署逻辑 (也就是 `TODO` 内的逻辑)：

```ts
// 获取本地构建模块的文件路径

async function deploy(conn) {
  try {
    // 获取所有文件的绝对路径
    const filePaths = await getAllFilePath(
      resolve(process.cwd(), config.distDir)
    )
    const dirs = filePaths.filter((target) => target.isDirectory)
    const paths = filePaths.filter((target) => target.isFile)
    const dirTask = dirs.map((target) => {
      // 创建远程目录文件夹
      return new Promise<void>((_resolve, rejects) => {
        const remoteDirPath = resolve(config.remotePath, target.relative)
        conn.exec(`mkdir -p ${remoteDirPath}`, (err) => {
          if (err) {
            rejects()
            return
          }
          _resolve()
        })
      })
    })

    // 等待所有远程目录文件夹创建完成
    await Promise.all(dirTask)

    // 文件传输
    const tasks = paths.map((path) => {
      return () => {
        return new Promise<void>((_resolve, rejects) => {
          const localFilePath = resolve(config.distDir, path.relative)
          const remoteFilePath = resolve(config.remotePath, path.relative)
          sftp.fastPut(localFilePath, remoteFilePath, (err) => {
            if (err) {
              console.log(err, localFilePath, remoteFilePath)
              rejects(err)
              process.exit(1)
            }
            console.log(
              chalk.green(path.relative + ' File transferred successfully')
            )

            _resolve()
          })
        })
      }
    })
    // 等待所有文件传输完后，关闭连接
    // 这里使用 executeConcurrency 控制并发数 如果所有的文件都一起上传，超过资源限制时会出现报错。
    await executeConcurrency(tasks, cpus().length)
  } catch (e) {
    console.log(chalk.red('部署失败: ' + e))
  } finally {
    conn.end()
  }
}
```

至此，也算完成了一个简易的部署流程。

## 参考资料

完整代码如下：

```ts
import chalk from 'chalk'
import { cpus } from 'os'
import { existsSync, lstatSync } from 'fs'
import { readFile } from 'fs/promises'
import { globSync } from 'glob'
import { relative, resolve } from 'path'
import { Client } from 'ssh2'
import yaml from 'yaml'
import { executeConcurrency } from '@cc-heart/utils'
const _cwd = process.cwd()

function isFile(path: string) {
  return existsSync(path) && lstatSync(path)?.isFile()
}

async function loadConfig() {
  const configStr = await readFile(resolve(_cwd, './application.yaml'), 'utf-8')
  return yaml.parse(configStr) as Config
}

async function getAllFilePath(rootPath: string) {
  return globSync(`${rootPath}/**/*`).map((path) => {
    const isFileFlag = isFile(path)
    return {
      path,
      relative: relative(rootPath, path),
      isFile: isFileFlag,
      isDirectory: !isFileFlag,
    }
  })
}

async function deploy() {
  const config = (await loadConfig()) || {}
  const conn = new Client()

  conn.on('ready', () => {
    conn.sftp(async (err, sftp) => {
      if (err) throw err
      console.log(chalk.green('SFTP 连接建立'))
      const filePaths = await getAllFilePath(
        resolve(process.cwd(), config.distDir)
      )

      try {
        const dirs = filePaths.filter((target) => target.isDirectory)
        const paths = filePaths.filter((target) => target.isFile)

        // dirs 创建文件夹
        const dirTask = dirs.map((target) => {
          // 远程目录创建文件夹
          return new Promise<void>((_resolve, rejects) => {
            const remoteDirPath = resolve(config.remotePath, target.relative)
            conn.exec(`mkdir -p ${remoteDirPath}`, (err) => {
              if (err) {
                rejects()
                return
              }

              _resolve()
            })
          })
        })

        await Promise.all(dirTask)

        const tasks = paths.map((path) => {
          return () => {
            return new Promise<void>((_resolve, rejects) => {
              const localFilePath = resolve(config.distDir, path.relative)
              const remoteFilePath = resolve(config.remotePath, path.relative)

              sftp.fastPut(localFilePath, remoteFilePath, (err) => {
                if (err) {
                  console.log(err, localFilePath, remoteFilePath)
                  rejects(err)
                  process.exit(1)
                }
                console.log(
                  chalk.green(path.relative + ' File transferred successfully')
                )

                _resolve()
              })
            })
          }
        })

        await executeConcurrency(tasks, cpus().length)
      } catch (e) {
        console.log(chalk.red('部署失败: ' + e))
      } finally {
        conn.end()
      }
    })
  })

  conn.connect(config)
}

deploy()
```

`executeConcurrency` 实现如下：

```ts
export async function executeConcurrency(
  tasks: Array<fn>,
  maxConcurrency: number
) {
  if (isUndef(maxConcurrency)) {
    console.warn('maxConcurrency is undefined')
    return null
  }
  const ret: Array<any> = []
  const excluding: any[] = []
  for (let i = 0; i < tasks.length; i++) {
    const res = tasks[i]()
    ret.push(res)

    if (maxConcurrency < tasks.length) {
      const p = res.then(() => excluding.splice(excluding.indexOf(p), 1))
      excluding.push(p)

      if (excluding.length >= maxConcurrency) {
        await Promise.race(excluding)
      }
    }
  }
  return Promise.all(ret)
}
```

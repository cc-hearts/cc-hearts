---
title: fastify logger 自定义日志
---

安装 依赖

```shell
pnpm i chalk split2 fast-json-parse
```

创建`log` 输出流 `logStream.ts`

```ts
import * as chalk from 'chalk'
import * as split from 'split2' // 处理文本流
import * as parse from 'fast-json-parse' // 格式化返回的对象
const levels = {
  [60]: 'Fatal',
  [50]: 'Error',
  [40]: 'Warn',
  [30]: 'Info',
  [20]: 'Debug',
  [10]: 'Trace',
}

const colors = {
  [60]: 'magenta',
  [50]: 'red',
  [40]: 'yellow',
  [30]: 'blue',
  [20]: 'white',
  [10]: 'white',
}

interface ILogStream {
  format?: () => void
}

export class LogStream {
  private readonly trans
  private readonly customFormat: (...args: any[]) => void

  public get getTrans() {
    return this.trans
  }

  constructor(opt?: ILogStream) {
    this.trans = split((data) => this.log(data))

    if (opt?.format && typeof opt.format === 'function') {
      this.customFormat = opt.format
    }
  }

  async log(data) {
    data = this.jsonParse(data)
    // console.log("logStream log data:", data);
    const level = data.level
    data = this.format(data)
    console.log(chalk[colors[level]](data))
  }

  jsonParse(data) {
    return parse(data).value
  }

  format(data) {
    if (this.customFormat) {
      return this.customFormat(data)
    }

    const Level = levels[data.level]
    const dateTime = new Date(data.time).toISOString()
    const logId = data.reqId || '_logId_'

    let reqInfo = '[-]'

    if (data.req) {
      reqInfo = `[${data.req.remoteAddress || ''} - ${data.req.method} - ${
        data.req.url
      }]`
    }
    if (data.res) {
      reqInfo = JSON.stringify(data.res)
    }

    // 过滤 swagger 日志
    if (data?.req?.url && data?.req?.url.indexOf('/api/doc') !== -1) {
      return null
    }
    return `${Level} | ${dateTime} | ${logId} | ${reqInfo} | ${
      data.stack || data.msg
    }`
  }
}
```

创建文件输入流`fileStream.ts`

```ts
import { stat, rename, createWriteStream, WriteStream } from 'fs'
import { dirname } from 'path'
import * as process from 'process'
import { LogStream } from './logStream'
import * as assert from 'assert'
import * as mkdirp from 'mkdirp'

const defaultOptions = {
  maxBufferLength: 4096, // 日志写入缓存队列的最大长度
  flushInterval: 1000,
  logRotator: {
    // 日志分割配置
    byHour: true,
    byDay: false,
    hourDelimiter: '_',
  },
}

const onError = (err) => {
  console.error(
    '%s Error %s [chair-logger:buffer_write_stream] %s: %s\\n%s',
    new Date().toString(),
    process.pid,
    err.name,
    err.message,
    err.stack
  )
}

const fileExists = async (path: string) => {
  return new Promise<boolean>((resolve, reject) => {
    stat(path, (err, stats) => {
      resolve(!err && stats.isFile())
    })
  })
}

const fileRename = async (oldPath, newPath) => {
  return new Promise((resolve, reject) => {
    rename(oldPath, newPath, (err) => {
      resolve(!err)
    })
  })
}

export class FileStream extends LogStream {
  private readonly options
  private bufferSize: number
  private timer
  private rotateTimer
  private buffer
  private stream: WriteStream
  private lastSuffixFileName: string

  constructor(options) {
    super(options)
    assert(options.fileName, 'should pass options.fileName')
    this.options = { ...defaultOptions, ...options }
    this.stream = null
    this.timer = null
    this.bufferSize = 0
    this.buffer = []
    this.reload()
    this.rotateTimer = this.createRotateInterval()
  }

  /**
   * 重载日志文件
   */
  reload() {
    // 关闭原来的流
    this.close()
    // 创建一个新的流
    this.stream = this.createStream()
    this.timer = this.createIntervalFlush()
  }

  /**
   * 重载流
   */
  reloadStream(fileName?: string) {
    this.closeStream()
    this.stream = this.createStream(fileName)
  }

  // @ts-ignore
  log(data): void {
    data = this.format(this.jsonParse(data))
    if (data) this.write(data + '\n')
  }

  write(buf) {
    this.bufferSize += buf.lenth
    this.buffer.push(buf)
    if (this.bufferSize > this.options.maxBufferLength) {
      this.flush()
    }
  }

  flush() {
    this.stream.write(this.buffer.join(''))
    this.bufferSize = 0
    this.buffer = []
  }

  /**
   * 关闭流
   */
  close() {
    // 关闭定时器
    this.closeIntervalFlush()
    if (this.buffer && this.buffer.length > 0) {
      this.flush()
    }
    this.closeStream()
  }

  createIntervalFlush() {
    return setInterval(() => {
      this.flush()
    }, this.options.flushInterval)
  }

  closeIntervalFlush() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * 创建流
   * @private
   */
  private createStream(fileName?: string) {
    const name = fileName || this.options.fileName
    mkdirp.sync(dirname(name))
    const stream = createWriteStream(name, { flags: 'a' })
    stream.on('error', onError)
    return stream
  }

  /**
   * 关闭流
   * @private
   */
  private closeStream() {
    if (this.stream) {
      this.stream.end()
      this.stream.removeListener('error', onError)
      this.stream = null
    }
  }

  // 获取文件后缀名
  getSuffixFileName() {
    let suffixFileName
    const date = new Date()
    const currentDate = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`
    if (this.options.logRotator.byHour) {
      suffixFileName = `${currentDate}${
        this.options.logRotator.hourDelimiter
      }${date.getHours()}`
    } else {
      suffixFileName = `${currentDate}`
    }
    return `.${suffixFileName}`
  }

  checkRotateLog() {
    const suffixFileName = this.getSuffixFileName()
    if (this.lastSuffixFileName === suffixFileName) {
      return
    }
    this.renameOrDelete(
      this.options.fileName,
      this.options.fileName + suffixFileName
    )
      .then(() => {
        this.lastSuffixFileName = suffixFileName
        // 更改名字成功后
        this.reloadStream(this.options.fileName + suffixFileName)
      })
      .catch((e) => {
        console.error('renameOrDelete', e)
        this.reloadStream()
      })
  }

  async renameOrDelete(oldPath, targetPath) {
    if (oldPath === targetPath) {
      return
    }
    const isExists = await fileExists(oldPath)

    if (!isExists) return Promise.reject('file is exists')

    if (await fileExists(targetPath)) {
      console.log(`targetFile ${targetPath} exists!!!`)
      return
    }

    await fileRename(oldPath, targetPath)
    console.log('fileRename success')
  }

  /**
   * 日志分割定时
   */
  createRotateInterval() {
    return setInterval(() => {
      this.checkRotateLog()
    }, this.options.checkRotateLogTimer || 1000)
  }
}
```

`fastify log` 配置函数

```ts
// logger.ts
import * as process from 'process'
import { join } from 'path'
import { LogStream } from './logStream'
import { FileStream } from './fileStream'
import pino from 'pino-multi-stream' // 替换输出流

export const fastifyLogger = (opt) => {
  console.log('opt:', opt)
  const reqIdGeneratorFactory = () => {
    let maxInt = 2 ** 31 - 1
    let nextReqId = 0
    return (req) => {
      return (
        req.headers['X-TT-logId'] ||
        req.headers['x-tt-logId'] ||
        (nextReqId = (nextReqId + 1) & maxInt)
      )
    }
  }

  // 请求序列化函数
  const serializersRequest = (req) => {
    if (req.raw) {
      req = req.raw
    }
    // console.log("serializersRequest req.raw:", req);
    const { method, url } = req
    const remoteAddress = req.connection ? req.connection.remoteAddress : ''
    const remotePort = req.connection ? req.connection.remotePort : ''
    return { method, url, remoteAddress, remotePort }
  }

  const requestOpt = {
    console: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    level: 'info',
    fileName: join(process.cwd(), 'logs/fastify.log'), // 日志生成的文件path
    genReqId: reqIdGeneratorFactory(), // reqId
    serializers: {
      // 日志序列号工具
      req: serializersRequest,
    },
    // formatOpts: {
    //   lowres: true
    // },
    ...opt,
  }

  const allStreams = [
    {
      // 添加日志记录以及日志切割
      stream: new FileStream(requestOpt).getTrans,
    },
  ]

  // 开发环境下 在控制台打印日志
  if (requestOpt.console) {
    allStreams.push({
      stream: new LogStream().getTrans,
    })
  }
  // 替换输出流输出
  // requestOpt.stream = new LogStream().getTrans;
  requestOpt.stream = pino.multistream(allStreams)
  return requestOpt
}
```

创建 logger 配置

```ts
// index.ts
import { join } from 'path'
import { fastifyLogger } from './logger'

// TODO: 如果日志当前的日志存在 后续再次拼接日志分割字符串创建新的日志文件
let logOpt = {
  console: process.env.NODE_ENV !== 'production', // 是否开启 console.log
  level: 'info',
  fileName: join(process.cwd(), 'logs/fast-gateway.log'), // 日志文件路径
  maxBufferLength: 4096, // 日志写入缓存队列最大长度
  // flush 的理解 参照
  flushInterval: 1000, // flush间隔
  logRotator: {
    // 日志分割配置
    byHour: true, // 日志切割是否以小时为单位
    byDay: false,
    hourDelimiter: '_', // 小时单位的日志切割的分割符
  },
}

export const FastifyLogger = fastifyLogger(logOpt)
```

在`main.ts`中使用`fastify 的log`配置

```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import fastify from 'fastify'
// 这里导入的就是上述的index.ts
import { FastifyLogger } from './logger'
import { generatorSwaggerDocument } from './lib/swagger.provider'
import { ValidationPipe } from '@nestjs/common'

const fastifyInstance = fastify({
  logger: FastifyLogger,
})

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance)
  )
  generatorSwaggerDocument(app)

  // 注册全局的校验管道
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(3000, '0.0.0.0')
}

bootstrap()
```

---
title: exception filter 异常过滤器
---

## Catch all exception

> `@Catch()`的参数 为空 会接收所有的错误的异常情况

```ts
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { exceptionResponse } from '../typings'

@Catch()
export class ExceptionFilters implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): any {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse()
    const req = ctx.getRequest()
    let code: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
      message: Array<string> | string = '请求失败'

    if (exception instanceof HttpException) {
      code = exception.getStatus()
      message = res.message || exception.message || '请求失败'
    }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse() as exceptionResponse
      if (typeof response === 'object') {
        message = response.message
      } else {
        message = response
      }
    }

    res.status(code).json({
      code,
      message,
      timestamp: new Date().toISOString(),
      path: req.path,
    })
  }
}
```

## 参考资料

- [exception filters nestJs docs](https://docs.nestjs.com/exception-filters)

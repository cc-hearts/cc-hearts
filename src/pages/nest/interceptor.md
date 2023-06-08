---
title: 拦截器的使用
---

## http 拦截器的使用

http 拦截器需要去实现`NestInterceptor` 接口 这里主要封装一个全局拦截器用于对`http` 相应进行一个统一的封装逻辑处理

```ts
@Injectable()
export class ResponseInterceptor<T extends BaseResponse>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest()
    return next.handle().pipe(
      map((val) => {
        if (val === void 0) val = Object.create(null)
        const { data = void 0, code = 500, message = '' } = val
        return new BaseResponseImpl(message?.toString?.(), data, code, {
          path: request.url,
        })
      })
    )
  }
}
```

```ts
// BaseResponseImpl 的实现
import { HttpStatus } from '@nestjs/common'

interface otherParams {
  path?: string
  timestamp?: string
}
export class BaseResponseImpl<T> implements BaseResponse {
  public readonly path?: otherParams['path']
  public readonly timestamp?: otherParams['timestamp']
  constructor(
    public readonly message: string,
    public readonly data?: T,
    public readonly code = HttpStatus.OK,
    otherParams?: otherParams
  ) {
    if (otherParams) {
      const { path, timestamp } = otherParams
      this.path = path
      this.timestamp = timestamp || new Date().toISOString()
    }
  }
}

export function throwErrorResponse<T>(
  message: string,
  data?: T,
  otherParams?: otherParams
): BaseResponseImpl<T> {
  return new BaseResponseImpl(
    message,
    data,
    HttpStatus.INTERNAL_SERVER_ERROR,
    otherParams
  )
}
```

在`main.ts` 中注册全局的拦截器

```ts
import { ResponseInterceptor } from './interfaces/interceptor'
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // 全局拦截器 用于对 http返回做统一处理
  app.useGlobalInterceptors(new ResponseInterceptor())
}
```

或者实现一个局部拦截器用于查看接口的请求用时

```ts
export class interceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const start = Date.now();
    console.log("------before", start);
    return next.handle().pipe(
      map((val) => {
        const end = Date.now();
        console.log("------after", end);
        console.log(end - start);
        return val;
      })
    );
  }
```

```ts
  @UseInterceptors(interceptor)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
```

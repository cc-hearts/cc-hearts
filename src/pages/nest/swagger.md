---
title: swagger 文档生成
---

1. 首先安装所需要的依赖包

```shell
pnpm add @nestjs/swagger
```

创建`swagger.provider.ts` 文件 进行对 `swagger` 生成文档的封装

```ts
// getPkg 获取package.json 中的数据
export function getPkg() {
  // TODO: resolve 需要自身替换
  const pkg = fs.readFileSync(
    path.resolve(__dirname, '../../', 'package.json'),
    { encoding: 'utf-8' }
  )
  return JSON.parse(pkg)
}
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { getPkg } from '../utils'
import { INestApplication } from '@nestjs/common'

function generatorSwaggerConfig() {
  const pkg = getPkg()
  return new DocumentBuilder()
    .setTitle(pkg.name)
    .setDescription(pkg.description)
    .setVersion(pkg.version)
    .build()
}

export function generatorSwaggerDocument(app: INestApplication) {
  const config = generatorSwaggerConfig()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
}
```

在`main.ts` 中引入 `generatorSwaggerDocument` 调用生成`swagger` 文档

```ts
generatorSwaggerDocument(app)
```

> `swagger` 提供 json 格式的数据 可以导入到 `yaml` 等接口文档软件中 如果`swagger` 是`http://xxx/api` 则 json 数据的 URL 就是
> `http://xxx/api-json`

## 参考资料

- [nest docs introduction](https://docs.nestjs.com/openapi/introduction)

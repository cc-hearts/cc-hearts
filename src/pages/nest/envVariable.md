---
title: 环境变量 配置
---

# 环境变量

## env 环境变量配置

通过在 `app.module.ts`中注入 `envFilePath`的属性 引入环境变量

`envFilePath`是一个数组结构 后面的优先级会比前面的优先级要高

```ts
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 后面的权重会比前面的权重更高
      envFilePath: ['.dev.env', '.test.env'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

> `main.ts`中 可以使用 process.env.xxx 获取到 env 中的配置信息

```ts
import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.prot || 3000
  await app.listen(port, () => {
    Logger.log(`服务端启动 http://localhost:${port}`)
  })
}
bootstrap()
```

`env` 加载环境变量的方式 可以通过不同的启动命令 更改`node` 环境变量的配置 从而加载不同的文件

> 引入 cross-env 这个包 再启动的时候更改参数

```ts
{
  "scripts": {
    "start": "cross-env NODE_ENV=dev nest start ",
    "start:dev": "cross-env NODE_ENV=dev nest start --watch",
    "start:debug": "cross-env NODE_ENV=dev nest start --debug --watch",
    "start:prod": "cross-env NODE_ENV=prod node dist/main",
  }
}
```

修改 `app.module.ts` 中的配置

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.${process.NODE_ENV}.env`],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

这样就 可以根据不同的环境 加载不同的变量信息

## env 环境配置 mySql

贴合`ts` 的`ORM` 的轮子有很多，这里使用的`ORM`的轮子是 `typeorm` 配置的内容如下

```ts
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV || 'development'}.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      /**
       * @see: https://www.toimc.com/nestjs-example-project-5/
       * @see: https://blog.csdn.net/aminwangaa/article/details/123229306
       * @see: https://docs.nestjs.com/techniques/configuration
       * @see: https://stackoverflow.com/questions/59607560/nestjs-typeorm-configuration-works-but-not-with-configservice
       * @param config
       * @returns
       */
      useFactory: async (config: ConfigService) => {
        return {
          type: config.get('DATABASE_TYPE'),
          host: config.get('DATABASE_HOST'),
          port: config.get('DATABASE_PORT'),
          username: config.get('DATABASE_USER'),
          password: config.get('DATABASE_PASSWORD') as string,
          database: config.get('DATABASE') as any,
          entities: ['./**/*.entity.js'],
          synchronize: true,
          logging: true,
          cache: false,
          maxQueryExecutionTime: 1000,
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
```

之后可以在 service 通过依赖注入拿到数据库配置的值

```ts
import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService
  ) {}

  @Get()
  getHello(): string {
    // configServices可以获取到环境变量的值
    const dbUser = this.configService.get<string>('DATABASE_USER')
    console.log(dbUser)
    return this.appService.getHello()
  }
}
```

## yml 环境变量配置

在`app.modules.ts` 中也是通过注入的方式 将 yml 的中的配置注入

这样的好处就是可以使用 在其他的模块中可以注入用`ConfigService` 读取到配置文件的信息

首先定义一个 读取`yaml` 的方法

```ts
function getYaml(yamlPath: string) {
  try {
    const file = fs.readFileSync(yamlPath, 'utf8')
    const config = parse(file)
    return config
  } catch (e) {
    throw Error('get yaml error:' + e)
  }
}

export const getConfig = () => {
  const env = getEnv()
  const yamlPath = path.join(__dirname, `../../application.${env}.yml`)
  return getYaml(yamlPath)
}

export const getDefaultConfig = () => {
  const yamlPath = path.join(__dirname, `../../application.yml`)
  return getYaml(yamlPath)
}
```

> 这里将配置信息 分割成两份 一份是全局注入需要读取的配置文件 为`application.dev.yml` 还有一份是编译阶段的配置文件`application.yml`

```diff
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
+ import { getConfig } from './utils/shard';
@Module({
  imports: [
    ConfigModule.forRoot({
+     // 禁用默认读取 .env 的规则
+     ignoreEnvFile: true
      isGlobal: true,
+      load: [getConfig],
-      envFilePath: [`.${process.NODE_ENV}.env`],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

再修改`main.ts` 中的启动方法

```diff
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
+ import { getDefaultConfig } from './utils/shard';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
+  const { http } = getDefaultConfig();
+  const port = http.port || 3000;
-  const port = process.env.prot || 3000;
-  const port = process.env.prot || 3000;
  await app.listen(port, () => {
    Logger.log(`服务端启动 http://localhost:${port}`);
  });
}
bootstrap();
```

## helmet 配置

TODO:

> [helmet](https://cloud.tencent.com/developer/section/1490189)

## 限流配置

TODO:

## 参考资料

- [nest docs Configuration](https://docs.nestjs.com/techniques/configuration#getting-started)

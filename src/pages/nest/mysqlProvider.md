---
title: mysql 配置
---

## 安装依赖

> ORM 库选择为`typeorm`

```shell
npm install typeorm mysql2
```

## provider

`database.provider.ts` 用于提供数据库连接的配置

> 这里使用的配置文件是`yaml` 配置文件 读取的 mysql 的连接属性 `yaml` 属性配置请看[环境变量](./envVariable.md)

```ts
import { DataSource } from 'typeorm'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getConfig, isProd } from '../utils'

export const mysqlConfig = () => {
  const { mysql } = getConfig()
  return Object.assign({}, mysql, {
    entities: [__dirname + '../../**/*.entity{.ts,.js}'], // 配置实体类的位置
    synchronize: !isProd(), //  生产环境关闭 如果为 true，那么在连接数据库时，typeorm 会自动根据 entity 目录来修改数据表 可能造成的结果是直接删除数据
    autoLoadEntities: !isProd(),
  })
}
export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const databaseConfig = mysqlConfig()
      const dataSource = new DataSource(databaseConfig)
      return dataSource.initialize()
    },
  },
]
const getMysqlConfig = mysqlConfig()
export default [TypeOrmModule.forRoot(getMysqlConfig)]
```

`getConfig` 方法:

> 使用之前需要安装第三方依赖`npm install yaml`

```ts
import { parse } from 'yaml'
import { readFileSync } from 'fs'
import * as process from 'process'
import { resolve } from 'path'
interface IConfig {
  mysql: {
    type: 'mysql'
    database: string
    username: string
    password: string
    host: string
    logging: boolean
    port: number
  }
}
let config: IConfig
export function getConfig() {
  if (!config) {
    const env = process.env.NODE_ENV || 'development'
    const data = readFileSync(resolve(process.cwd(), `app.${env}.yaml`), {
      encoding: 'utf-8',
    })
    if (data) {
      config = parse(data)
    } else {
      throw new Error('readFile yaml is error:')
    }
  }
  return config
}
```

`isProd` 方法:

```ts
import * as process from 'process'

export const isProd = () => process.env.NODE_ENV === 'production'
```

## 数据库配置文件

```yaml
mysql:
  type: mysql
  database: exam
  username: root
  password: '123456'
  host: localhost
  logging: true # 打印日志
  port: 3306
```

## 在`app.module.ts` 中引入

现在在`app.module.ts` 中引入 `dataBase.provider.ts`

```ts
import { Module } from '@nestjs/common'
import dataBaseProvider from 'provider/dataBase.provider'

@Module({
  imports: [...dataBaseProvider],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

或者使用另外一种提供模块的方式

```ts
import { Module } from '@nestjs/common'
import dataBaseProvider from 'provider/dataBase.provider'

@Module({
  controllers: [],
  providers: [...dataBaseProvider],
  exports: [...dataBaseProvider],
})
export class AppModule {}
```

## 创建一个实体类

> 一般的实体类 以`xxx.entity.ts` 为后缀

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ default: null, comment: '名称' })
  name: string
}
```

## 创建实体类的 provider

创建实体类的`provider` 第一种方式是在`module` 中 以`imports` 的方式直接导入

> 通过`TypeOrmModule.forFeature` 引入`provider `

```ts
import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

之后的依赖注入依然是通过`typeOrm` 提供的`InjectRepository` 装饰器注入

```ts
constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
```

另外一种方式就是使用`Inject` 装饰器注入的方式，这需要以下方式声明`provider`

> 创建一个文件为`user.provider.ts`

```ts
import { DataSource } from 'typeorm'
import { User } from './user.entity'

export const provider = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'], // 上面的exports dataBaseProvider 就是为了这里能够inject
  },
]
```

使用`@Inject` 注入依赖

```ts
constructor(
	@Inject('USER_REPOSITORY')
  private readonly userRepository: Repository<User>,
)
```

## 参考资料

- [nestJs sql-typeorm](https://docs.nestjs.com/recipes/sql-typeorm#sql-typeorm)

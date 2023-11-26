---
title: Nest Entity Provider CLI 的实现
date: 2023-09-06
articleId: 97aa8ae5-f900-42f9-9db9-9367a2f635cf
---

# Nest Entity Provider CLI 的实现

Nest CLI 提供了一系列命令，可以帮助开发者快速初始化新的 Nest.js 项目，生成模块、控制器和服务等。

```shell
nest g res user
```

生成的模块如下所示：

> tree user

```shell
user
├── dto
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities
│   └── user.entity.ts
├── user.controller.spec.ts
├── user.controller.ts
├── user.module.ts
├── user.service.spec.ts
└── user.service.ts
```

虽然生成了 `user.entity.ts`，但此时与 `user.module.ts` 模块却没有任何关联。一般还需要开发者手动去定义 `provider` 然后在 `user.module.ts` 中引入。如下所示：

```ts
// provider.factory.ts
type ctor = { new (...args: any): object }

export const ProviderFactory = (provide: string | ctor, repository: ctor) => {
  return {
    provide,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(repository),
    // DATA_SOURCE 就是 databaseProvider的Key
    // 通过在 inject 指明 Provider 的 token，可以在 useFactory 中注入值
    inject: [DATA_SOURCE],
  }
}
```

```ts
// user.provider.ts
import { USER_PROVIDER } from '../constants/user.constants'
import { User } from '../entities/user.entity'
import { ProviderFactory } from '../../utils/provider.factory'

export const UserProvider = ProviderFactory(USER_PROVIDER, User)
```

在 `user.module.ts` 中使用

```diff
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
+ import { UserProvider } from './provider/user.provider';

@Module({
  controllers: [UserController],
-  providers: [UserService],
-  exports: [UserService],
+  providers: [UserService, UserProvider],
+  exports: [UserService, UserProvider],
})
export class UserModule {}

```

对于每一个新的模块，基本都要这样去修改文件，十分繁琐。下面，我们将逐步实现一个 `Entity Provider CLI`。

## command 的实现

依据 `nest res user` 的命令，会在 `src` 下生成 `user` 目录并且生成 `user.module.ts` 等文件。现在，我们实现一个 `pnpm provider user` 命令，使其也能在 `src` 目录下生成 `user/provider` 目录，并且生成 `user.provider.ts`。

首先，需要获取 `pnpm provider <module_name>` 中的模块名。

```ts
export async function getCommand() {
  const argv = process.argv.slice(2)
  let [providerName] = argv
  if (!providerName) {
    throw new Error('generator provider template is invalid name')
  }
  // 获取需要生成的模块名
  providerName = providerName.trim()
  try {
    let nestCliJson: Record<string, unknown> | string = await readFile(
      resolve(process.cwd(), 'nest-cli.json'),
      { encoding: 'utf-8' }
    )
    nestCliJson = JSON.parse(nestCliJson)
    if (isObject(nestCliJson)) {
      const sourceRoot = Reflect.get(nestCliJson, 'sourceRoot') as string
      const pathRoot = resolve(process.cwd(), sourceRoot)
      // 获取 CLI生成的路径的根目录 是 nest-cli.json 中的 sourceRoot 字段
      return { pathRoot, providerName }
    }
    return null
  } catch (e) {
    console.log(e)
  }
}
```

## 定义模版文件

这里使用 `handlebars` 来实现 `provider` 模版。

```shell
pnpm i handlebars
```

定义模版文件：

```js
// provider.template.js
import { ProviderFactory } from '../../utils/provider.factory';
{{#if isExistsEntity}}
import { {{ providerEntityImportName }} } from '../entities/{{ providerEntityFileName }}.entity';
{{ else }}
class {{ providerEntityImportName }} {}
{{/if}}

export const {{ providerName }} = '{{ providerNameUpper }}';
export const {{ exportName }} = ProviderFactory({{ providerName }}, {{ providerEntityImportName }});
```

至此，准备工作已经完成，接下来将模版编译成 `provider` 并写入特定的路径中。

```ts
// plugins/generatorProviderTemplate/index.ts
let dryRun = false,
  isExistsEntity = false
// 从命令行中获取 provider 的名称和 生成路径的根目录
const { providerName: variable, pathRoot: originRoot } =
  (await getCommand()) || {}
// 对 provider名称的 kebab-case 转换成 camelCase
const variableName = variable
  .split('-')
  .map((val) => capitalize(val))
  .join('_')

const pathRoot = resolve(originRoot, variable)
// 导入的名称 对应生成的 entity 中的 class 名称
const providerEntityImportName = shortLine2VariableName(variable.split('-'))
if (
  existsSync(resolve(process.cwd(), pathRoot, `entities/${variable}.entity.ts`))
) {
  isExistsEntity = true
}
const providerEntityFileName = variable
const providerName = `${variableName}_provider`.toUpperCase()
const providerNameUpper = providerName
// 导出的Provider名称
// 例如 pnpm provider user-role 生成的将是 userRoleProvider
const exportName = shortLine2VariableName([...variable.split('-'), 'provider'])
// 读取模版文件
const templateCode = await readFile(resolve(__dirname, './template.tmpl.js'), {
  encoding: 'utf-8',
})
// 对模版进行编译
const templateFn = compile(templateCode)
// 生成code
const code = templateFn({
  providerEntityImportName,
  providerEntityFileName,
  providerName,
  providerNameUpper,
  exportName,
  isExistsEntity,
})
const fileDirPath = resolve(process.cwd(), pathRoot, 'providers')
const filePath = resolve(fileDirPath, `${variable}.provider.ts`)

if (existsSync(filePath)) {
  dryRun = true
}
if (dryRun) {
  // dryRun 为 true 时 不写入磁盘
  console.log(`dry run generator file path: ${filePath} success`)
} else {
  // 生成的code 写入文件
  await writeProviderFile(fileDirPath, filePath, code)
  console.log(`generator file path: ${filePath} success`)
}
```

通过 `CLI` 生成一个 Provider 现在已初步完成。

使用 `pnpm provider dep` 创建一个模版文件试试：

> 1. 需要先使用 `nest g res dep` 生成对应的 `entities`。
> 2. 在运行 `pnpm provider dep` 之前需要在 `package.json` 中的 `script` 指定 `provider` 运行 `provider.script.ts` 文件。

![image-20230907120200526](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-09-07/image-20230907120200526.png)
运行完成后，对应的 `dep` 模块下会生成一个 `provider` 文件夹，里面会有一个 `dep.provider.ts` 文件。
![image-20230907120227168](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-09-07/image-20230907120227168.png)
![image-20230907120302316](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-09-07/image-20230907120302316.png)

## 实现与 modules 联动

现在对应的模版文件虽然可以生成，但是没有和 `dep.module.ts` 文件产生关联。接下来，我们将使用 `babel` 对 `module` 进行改造。

```shell
pnpm i @babel/traverse @babel/generator @babel/template @babel/types  @babel/parser --save-dev
```

```ts
// babel-parse.ts
export const generatorModulesProvider = (
  sourceCode: string,
  importPath: string,
  providerName: string
) => {
  const ast = parse(sourceCode, {
    sourceType: 'module',
    presets: ['@babel/preset-typescript'],
    plugins: ['decorators'],
  } as ParserOptions)

  traverse(ast, {
    Program(path) {
      let importDeclarationIndex = 0
      if (Array.isArray(path.node.body)) {
        for (let i = 0; i < path.node.body.length; i++) {
          if (path.node.body[i].type !== 'ImportDeclaration') {
            importDeclarationIndex = i
            break
          }
        }
      }
      const importAst = template.ast(importPath)
      if (!isExistsImportProviderName(path.node.body, providerName))
        path.node.body.splice(importDeclarationIndex, 0, importAst)
    },
    ClassDeclaration(path) {
      for (let i = 0; i < path.node.decorators.length; i++) {
        if (path.node.decorators[i].expression.callee.name === 'Module') {
          const target =
            path.node.decorators[i].expression.arguments[0].properties
          if (Array.isArray(target)) {
            for (let j = 0; j < target.length; j++) {
              if (target[j].key.name === 'providers') {
                if (
                  !isExistsModuleProvider(
                    target[j].value.elements,
                    providerName
                  )
                ) {
                  const ast = identifier(providerName)
                  target[j].value.elements.push(ast)
                }
              }
            }
          }
        }
      }
    },
  })
  const { code } = generate(ast)
  return code
}
// 判断是否已经导入过该文件
function isExistsModuleProvider(elements, providerName: string) {
  if (Array.isArray(elements)) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].name === providerName) {
        return true
      }
    }
  }
  return false
}
// 判断是否已经有 Provider 重名的模块
function isExistsImportProviderName(elements, providerName) {
  if (Array.isArray(elements)) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      if (
        element.type === 'ImportDeclaration' &&
        element.specifiers &&
        Array.isArray(element.specifiers)
      ) {
        for (let j = 0; j < element.specifiers.length; j++) {
          if (element.specifiers[j].local.name === providerName) {
            return true
          }
        }
      }
    }
  }
  return false
}
```

对 `plugins/generatorProviderTemplate/index.ts` 进行改造：

```diff
-   await writeProviderFile(fileDirPath, filePath, code)
+    let importRelativePath = relative(
+      resolve(process.cwd(), pathRoot),
+      filePath,
+    );
+    importRelativePath = importRelativePath.substring(
+      0,
+      importRelativePath.lastIndexOf('.'),
+    );
+    await Promise.all([
+      writeProviderFile(fileDirPath, filePath, code),
+      writeModuleProviderFile(
+        fileDirPath,
+        variable,
+        importRelativePath,
+        exportName,
+      ),
+    ]);
console.log(`generator file path: ${filePath} success`)
```

删除 `provider` 文件夹再次使用 `pnpm provider dep` 生成，即可看到会 `module` 会导入此生成的 `provider`。

![image-20230907120620224](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-09-07/image-20230907120620224.png)

## 结语

本文实现了一个简易的 Nest Entity Provider CLI。通过使用 `handlebars` 模版引擎实现 `provider` 模版的输出，并且使用 `babel` 对 `module` 进行改造，实现生成 `provider` 的同时自动在 `module` 中引入。

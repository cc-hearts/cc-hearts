---
title: upic-vscode 插件开发
date: 2023-10-27
articleId: b91191df-2f8a-418a-bc9d-d33d4119b2ed
---

在使用 vscode 编写 markdown 时，没有像 `typora` 的图片上传服务，如果想要将图片上传到 OSS 并且应用在 markdown 中，需要经过：

1. 通过 `ctrl/command + v` 粘贴图片到本地
2. 通过快捷键或者第三方的 App 上传到 OSS
3. 等待 OSS 返回图片的 URL，并且修改 markdown 中的图片地址

这些操作在 markdown 中会频繁进行，非常耗时。

为解决这个问题，便准备写一个 vscode 插件，实现在 markdown 中粘贴图片，自动将图片上传到 OSS 服务器，并修改本地的图片地址。

## 环境安装

安装 CLI

```Shell
# npm
npm install -g yo generator-code
```

通过 CLI 快速生成项目

```Shell
yo code # 填写信息后生成一个能快速开发的项目
```

## 环境配置

在执行完 `ctrl/command + v` 之后，vscode 会将图片保存在本地，因此我们要去配置 `package.json` 中的 `keybindings`
，监听 `ctrl/command + v` 之后触发命令。

```json5
{
  contributes: {
    keybindings: {
      // ctrl/command + v 触发 upic-vscode.pasteCommand 命令
      command: 'upic-vscode.pasteCommand',
      key: 'ctrl+v',
      mac: 'cmd+v',
      // 当扩展名是 md 时 触发快捷键
      when: 'resourceExtname == .md',
    },
  },
}
```

配置完 `keybindings`，还需要配置一下插件在 `markdown` 中启用

```json
{
  "activationEvents": ["onLanguage:markdown"]
}
```

## 前置准备

在 `active` 中进行自定义命令的注册

```ts
export function activate(context: vscode.ExtensionContext) {
  // 注册 upic-vscode.pasteCommand 命令
  const disposable = vscode.commands.registerCommand(
    'upic-vscode.pasteCommand',
    async () => {
      // ...
    }
  )

  context.subscriptions.push(disposable)
}
```

通过 `vscode-debugger` 启动调试

![image_1698407518186](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-10-27/image_1698407518186.png)

## 插件开发

现在，将正式进入插件的开发阶段，首先，理清需求：

- 在 markdown 中粘贴图片， 先执行 `vscode` 的 `paste` 命令。
- 根据本地生成的图片，获取图片路径，通过 upic 发送到 OSS 保存。

因此 `upic-vscode.pasteCommand` 的 回调函数核心代码可以写成：

```ts
;async () => {
  // 执行vscode原本的粘贴操作
  await vscode.commands.executeCommand('editor.action.clipboardPasteAction')

  const text = await vscode.env.clipboard.readText()
  // 如果 text 有值，则不是图片类型
  if (text) {
    return
  }
  // ...
  const editor = vscode.window.activeTextEditor
  if (editor) {
    const selection = editor.selection
    const lineNumber = selection.active.line
    // 获取光标所在行的值
    const lineText = editor.document.lineAt(lineNumber).text
    // 获取 markdown 活跃文件的路径
    const fileDirectory = dirname(editor.document.uri.path)
    const replaceImage = [] as Array<ImageMeta>
    const reg = /\!\[(.*)\]\((.*)\)/g
    const match = lineText.match(reg)
    // 匹配光标行所需要上传的图片文件信息
    match?.forEach((item) => {
      const reg = /\!\[(.*)\]\((.*)\)/
      const matcher = item.match(reg)
      if (matcher) {
        const [originStr, name, imageName] = matcher
        replaceImage.push({ originStr, name, imageName })
      }
    })
    // ....
    // 上传文件至 uPic
    const imageToken = await uploadWithUPic(replaceImage, fileDirectory)
    // 获取上传之后的 OSS 图片路径 替换本地的图片路径
    if (Array.isArray(imageToken) && imageToken.length > 0) {
      const _data = imageToken.filter((data) => !!data) as Array<{
        originStr: string
        newStr: string
      }>
      const text = textReplace(lineText, _data)
      const range = editor.document.lineAt(lineNumber).range
      editor.edit((editBuilder) => {
        editBuilder.replace(range, text)
      })
    }
  }
}
```

## 插件发布

安装管理插件的命令行的工具

```Shell
#npm
npm install -g @vscode/vsce
 # vsce 已经被废弃 改用 @vsce/vsce
```

注册 [Azure DevOps](https://dev.azure.com/) 获取 `accessToken`

![image_1698409930091](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-10-27/image_1698409930091.png)

注册一个 `accessToken` 时需要开启 `Marketplace` 的 `publish` 权限

> 注册 `Name` 字段与后续 `marketplace` 中的 `id` 字段要对应

![image_1698410042194](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-10-27/image_1698410042194.png)

在 [marketplace](https://marketplace.visualstudio.com/manage/createpublisher) 创建一个 `publisher`

![image_1698410424515](https://pic.jxwazx.cn/oss/file/WPJTOOANlAvXos4EJeb0m/2023-10-27/image_1698410424515.png)

之后通过命令行

```Shell
vsce login <publisher name>
```

之后输入访问令牌的 `accessToken`

```Shell
// 验证身份成功的提示
The Personal Access Token verification succeeded for the publisher 'cc-xxxx'.
```

之后便可以通过 `vsce publish` 发布插件

```Shell
//  vsce package 作用是将插件打包
vsce package
```

## 升级插件

类似于 `npm version major|minor|patch` 的操作，在发布时候可以指定参数去变更版本信息

```Shell
vsce publish major|minor|patch
```

或者可以指定变更的版本

```Shell
vsce publish 1.0.0
```

插件代码已同步至 [Github](https://github.com/cc-hearts/upic-vscode.git), 感兴趣可以点个 `star`

## 参考资料

- <https://code.visualstudio.com/api/working-with-extensions/publishing-extension>
- <https://juejin.cn/post/7276065587938508859#heading-2>
- <https://juejin.cn/post/6979776894954799118>
- <https://blog.svend.cc/upic/>
- <https://code.visualstudio.com/api/references/when-clause-contexts>

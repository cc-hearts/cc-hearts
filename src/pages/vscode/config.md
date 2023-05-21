---
title: Visual Studio Code Config
---

```json
{
  // 保存之后是否格式化
  "explorer.compactFolders": false,

  // tab缩进
  "editor.tabSize": 2,
  // 是否在解决合并冲突后自动转到下一个合并冲突
  "merge-conflict.autoNavigateNextConflict.enabled": true,
  // 延迟自动保存
  "files.autoSave": "afterDelay",
  // 等待5秒自动保存
  "files.autoSaveDelay": 5000,
  // 彩虹括号对
  "editor.bracketPairColorization.enabled": true,
  // 单词换行
  "editor.wordWrapColumn": 150,
  // 编辑器行高
  "editor.lineHeight": 25,
  // 保存文件时候删除行尾的空格
  "files.trimTrailingWhitespace": true,
  // 主题文件夹
  "workbench.iconTheme": "material-icon-theme",
  // 删除文件是否确认
  "explorer.confirmDelete": false,
  // 控制在资源管理器内拖放移动文件或文件夹时是否进行确认
  "explorer.confirmDragAndDrop": false,
  // 字体设置
  "window.commandCenter": true,
  "workbench.colorTheme": "Vitesse Dark",
  "workbench.preferredDarkColorTheme": "Vitesse Dark",
  "workbench.preferredLightColorTheme": "Vitesse Light",
  "workbench.fontAliasing": "antialiased",
  "window.autoDetectColorScheme": true,
  "terminal.integrated.enableMultiLinePasteWarning": false,
  "editor.fontFamily": "Input Mono, Fira Code, monospace",
  "editor.fontWeight": "500",
  "editor.fontLigatures": false,
  // 保存时使用VSCode 自身格式化程序格式化
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": false,
    "source.fixAll.eslint": true,
    "source.organizeImports": false
  },
  // 禁用 默认的 js/ts 格式化 使用eslint格式化
  "javascript.format.enable": false,
  "typescript.format.enable": false,
  // 使用eslint 格式化 js/ts
  "[javascript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  },
  "[typescript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  },
  "[json]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  // jsonc是有注释的json
  "[jsonc]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "eslint.format.enable": true,
  "eslint.codeActionsOnSave.mode": "problems",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "git.confirmSync": false,
  "git.openRepositoryInParentFolders": "always",
  "diffEditor.ignoreTrimWhitespace": false,
  "stylelint.validate": [
    "css",
    "less",
    "postcss",
    "scss",
    "vue",
    "sass"
  ]
}
```

在项目中 可以在`.vscode` 的 `settings.json` 中 设置参数配置

```json
{
  "editor.formatOnSave": false
}
```
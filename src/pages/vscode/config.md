---
title: Visual Studio Code Config
---

```json
{
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
  "editor.fontFamily": "Fira Code",
  "editor.fontWeight": "500",
  "editor.fontLigatures": false,
  "window.commandCenter": true,
  "workbench.colorTheme": "Vitesse Light",
  "workbench.preferredDarkColorTheme": "Vitesse Dark",
  "workbench.preferredLightColorTheme": "Vitesse Light",
  "workbench.fontAliasing": "antialiased",
  "window.autoDetectColorScheme": true,
  "terminal.integrated.enableMultiLinePasteWarning": false,
  // 保存文件进行格式化
  "editor.formatOnSave": true,
  // 是用eslint 格式化
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "html",
    "vue"
  ],
  "git.confirmSync": false,
  "git.openRepositoryInParentFolders": "always",
}
```

在项目中 可以在`.vscode` 的 `settings.json` 中 设置参数配置

```json
{
  "editor.formatOnSave": false
}
```
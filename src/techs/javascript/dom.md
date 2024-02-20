---
title: DOM 操作
date: 2024-02-20
articleId: aec3f396-d304-487a-bae1-796f4e0c69f7
---

# DOM 操作

## 页面可编辑元素

设置 contentEditable 则可以使得页面为可编辑页面

```js
document.body.contentEditable = true
```

## console 添加颜色

> %c：标识将 CSS 样式应用于 %c 之后的 console 消息。

```js
console.log('%c消息 是蓝色的 %c 这个是红色的', 'color:blue', 'color: red')
```

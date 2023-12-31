---
title: 伪类选择器
date: 2023-12-31
articleId: 43393dd4-f41d-4f7b-9b82-a68cd7fc1f49
---

# 伪类选择器

## ：is

`:is()` 可以取代选择器列表，传统的选择器列表如下：

```css
ul > li > a,
ol > li > a,
article > ul > li > a,
article > ol > li > a {
  color: red;
}
```

使用 `:is` 简化操作如下：

```css
:is (ul, ol, article > ul, article > ol) > li > a {
  color: red;
}
```

## ：where

`:where()` 选择器与 `:is()` 选择器相似，与之不同的是 `:where()` 选择器的优先级总是为 0。

## 参考资料

[MDN：is()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:is)

[MDN where()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:where)

[MDN：has()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:has)

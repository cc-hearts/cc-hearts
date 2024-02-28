---
title: 媒体查询
date: 2024-02-28
articleId: 663b0b9a-73df-44a3-9067-6df50f9c3d5f
---

# prefers-color-scheme

`prefers-color-scheme` 用于检测用户是否有将系统的主题色设置为亮色或者暗色。通过这个属性，可以让网页根据用户系统的颜色模式自动调整显示效果。这对于用户体验和可访问性都有很多好处。例如，如果用户喜欢在暗光环境下浏览网页，他们可以将系统设置为暗色模式，而网页可以根据这一设置自动切换到暗色主题，从而减少眼睛的疲劳和提高可读性。此外，对于一些用户来说，暗色模式也是一种辅助功能，可以帮助他们更好地使用网页，比如对于光敏性癫痫患者来说，暗色模式可以减少光引发的癫痫发作的可能性。

> 暗色模式还可以节省设备的电量

基本用法如下：

```css
:root {
  /* 通过 color-scheme 置顶可以呈现的配色方案 */
  color-scheme: light dark;
}

/* 在暗色模式下应用的样式 */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
    color: #fff;
  }
}

/* 在亮色模式下应用的样式 */
@media (prefers-color-scheme: light) {
  body {
    background-color: #fff;
    color: #000;
  }
}
```

<iframe height="300" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/hearto_o/embed/abxoPWM?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/hearto_o/pen/abxoPWM">
  Untitled</a> by cc heart (<a href="https://codepen.io/hearto_o">@hearto_o</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### 跟随系统主题

`prefers-color-scheme` 的出现使得在 `light` 和 `dark` 两种模式下有一种新型的配色方案：`跟随系统主题`，这个方案不同于之前的切换方式，配色方案的切换将由操作系统决定。

上述已经讲解了 `prefers-color-scheme` 媒体查询的方式切换配色方案，接下来将使用 `javaScript` 实现对操作系统的配色变化的监听。

```html
<style>
  :root {
    color-scheme: light dark;
  }
</style>
<script>
  const toggleDark = (isDark) => {
    document.documentElement.classList.toggle('dark', isDark)
  }

  const useDark = window.matchMedia('(prefers-color-scheme: dark)')
  toggleDark(useDark.matches)
  useDark.addListener(function (evt) {
    const isDarkMode = evt.matches
    toggleDark(isDarkMode)
  })
</script>
```

### 主题切换优化

传统主题配置会持久化存储在 `localStorage` 或服务端中，当下一次用户加载页面时，就可以获取上一次的配色方案，这么做虽然能够提高用户的使用体验。但是可能会存在一些弊端：

- 用户加载页面时可能会闪现默认配色方案。

```html
<style>
  :root {
    color-scheme: light dark;
  }

  body {
    background-color: #fff;
    color: #000;
  }

  .dark body {
    background-color: #000;
    color: #fff;
  }
</style>
<body>
  <!-- ... -->
</body>

<script>
  /* ... 模拟其他 JS 脚本加载 延迟 200ms 页面会出现闪烁 */
  setTimeout(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, 200)
</script>
```

页面的闪烁对用户的使用是极其糟糕的，为避免这种情况的发生，一般首选的方案就是将 JS 脚本提前执行，例如，放在 `head` 中初始化配色主题：

```html
<head>
  <script>
    // 脚本提前执行 防止页面加载闪烁
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  </script>
</head>
```

### 参考资料

- [dark-mode-website](https://www.ditdot.hr/en/dark-mode-website-tutorial)
- [MDN prefers-color-scheme](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media/prefers-color-scheme)

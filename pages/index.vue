<script setup lang="ts">
const lang = ref<'zh' | 'en'>('zh')

function toggleLang() {
  lang.value = lang.value === 'zh' ? 'en' : 'zh'
  if (import.meta.client) {
    localStorage.setItem('carl_lang', lang.value)
  }
}

onMounted(() => {
  const saved = localStorage.getItem('carl_lang')
  if (saved === 'zh' || saved === 'en') {
    lang.value = saved
  }
})

useHead(() => ({
  title: 'carl',
  bodyAttrs: { class: 'me-bare' },
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap' }
  ],
  meta: [
    {
      name: 'description',
      content: lang.value === 'zh'
        ? 'carl，一枚前端工程师，会点 node.js 和 go，目前反复入门 rust 中。'
        : 'carl, frontend engineer who knows some node.js and go. currently relearning rust.'
    }
  ]
}))
</script>

<template>
  <main class="me">
    <div class="me-inner">
      <img class="me-avatar" src="https://github.com/cc-hearts.png?size=96" alt="carl">

      <template v-if="lang === 'zh'">
        <p class="me-p me-p--lead">我是 carl，一枚前端工程师，会点 node.js 和 go。目前正在反复入门 rust 中，顺带折腾点 ai。</p>

        <p class="me-p">平时主力写 typescript、vue 和 react；偶尔写写 swift，做点顺手的原生小工具。开源上，我是<a class="pill" href="https://github.com/antdv-next" target="_blank" rel="noreferrer"><svg class="pill-ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>antdv-next</a>的核心贡献者，日常修 issue、提 pr、打磨组件；其余时间在自己的开源小组织<a class="pill" href="https://github.com/CarlOpenLab" target="_blank" rel="noreferrer"><svg class="pill-ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>carlopenlab</a>里倒腾东西。平时写的一些小工具也放在了github上：<a class="lnk" href="https://github.com/cc-hearts/tool-kit" target="_blank" rel="noreferrer">tool-kit</a>，还有一个用 swift 写的 macos 菜单栏应用<a class="lnk" href="https://github.com/cc-hearts/screen-rules" target="_blank" rel="noreferrer">screen-rules</a>。</p>

        <p class="me-p">想聊聊前端、开源或任何有意思的想法，可以在<a class="lnk" href="https://github.com/cc-hearts" target="_blank" rel="noreferrer">github</a>或<a class="lnk" href="https://juejin.cn/user/387492558675006" target="_blank" rel="noreferrer">掘金</a>找到我，也欢迎<a class="lnk" href="https://github.com/sponsors/cc-hearts" target="_blank" rel="noreferrer">赞助我</a>。</p>
      </template>

      <template v-else>
        <p class="me-p me-p--lead">i'm carl, a frontend engineer who knows some node.js and go. currently relearning rust (for the n-th time), and exploring ai on the side.</p>

        <p class="me-p">day to day, i mainly write typescript, vue, and react, with occasional swift for handy native tools. in open source, i'm a core contributor to <a class="pill" href="https://github.com/antdv-next" target="_blank" rel="noreferrer"><svg class="pill-ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>antdv-next</a> (the next generation of ant design vue), fixing issues, sending prs, and refining components; the rest of my time is spent tinkering in my own open-source collective, <a class="pill" href="https://github.com/CarlOpenLab" target="_blank" rel="noreferrer"><svg class="pill-ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>carlopenlab</a>. a few small tools i've built are also on github: <a class="lnk" href="https://github.com/cc-hearts/tool-kit" target="_blank" rel="noreferrer">tool-kit</a>, and a macos menu bar utility written in swift, <a class="lnk" href="https://github.com/cc-hearts/screen-rules" target="_blank" rel="noreferrer">screen-rules</a>.</p>

        <p class="me-p">feel free to reach out on <a class="lnk" href="https://github.com/cc-hearts" target="_blank" rel="noreferrer">github</a> or <a class="lnk" href="https://juejin.cn/user/387492558675006" target="_blank" rel="noreferrer">juejin</a> to talk frontend, open source, or anything interesting. you're also welcome to <a class="lnk" href="https://github.com/sponsors/cc-hearts" target="_blank" rel="noreferrer">sponsor me</a>.</p>
      </template>

      <footer class="me-foot">
        <span class="me-sign" aria-hidden="true">carl</span>
        <span class="me-icons">
          <a class="me-ico" href="https://github.com/cc-hearts" target="_blank" rel="noreferrer" aria-label="github">
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
          </a>
          <button
            class="me-ico me-lang"
            type="button"
            :aria-label="lang === 'zh' ? 'Switch to English' : '切换为中文'"
            :title="lang === 'zh' ? 'English' : '中文'"
            @click="toggleLang"
          >
            <span class="me-lang-btn">{{ lang === 'zh' ? 'en' : '中' }}</span>
          </button>
          <a class="me-ico" href="https://juejin.cn/user/387492558675006" target="_blank" rel="noreferrer" :aria-label="lang === 'zh' ? '掘金' : 'juejin'">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 14.316 7.454-5.88-2.022-1.625L12 11.1l-.004.003-5.432-4.288-2.02 1.624 7.452 5.88Zm0-7.247 2.89-2.298L12 2.453l-.004-.005-2.884 2.318 2.884 2.3Zm0 11.266-.005.002-9.975-7.87L0 12.088l.194.156 11.803 9.308 7.463-5.885L24 12.085l-2.023-1.624Z"/></svg>
          </a>

          <a class="me-ico" href="https://github.com/sponsors/cc-hearts" target="_blank" rel="noreferrer" :aria-label="lang === 'zh' ? '赞助' : 'sponsor'">
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 14.25c-.13 0-.26-.04-.37-.11L4.69 11.98c-1.75-1.19-2.88-3.18-2.88-5.35 0-2.4 1.87-4.26 4.26-4.26 1.06 0 2.08.45 2.93 1.26.85-.81 1.87-1.26 2.93-1.26 2.39 0 4.26 1.86 4.26 4.26 0 2.17-1.13 4.16-2.89 5.35l-2.93 2.16c-.11.07-.24.11-.37.11Z"/></svg>
          </a>
        </span>
      </footer>
    </div>
  </main>
</template>

<style>
/* about 页接管整页底色（全局，scoped 够不到 body） */
body.me-bare {
  background: var(--me-bg);
}
</style>

<style scoped>
/* —— 布局：1:1 sanyam.sh —— 单列 33.6rem，min-h-svh 垂直居中，px-6 py-16/20 */
.me {
  min-height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-16) var(--space-6);
  background: var(--me-bg);
  color: var(--me-ink);
  font-family: -apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif;
  font-size: 0.9rem;
  line-height: 1.6;
  text-transform: lowercase;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.me-inner { max-width: 33.6rem; width: 100%; }

.me-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: block;
  margin-bottom: 2em;
}

.me-p {
  margin: 0 0 2em;
  color: var(--me-soft);
  text-wrap: pretty;
}
.me-p--lead { color: var(--me-ink); }

/* 外链：灰胶囊 + 站点 favicon；align-middle 与正文居中对齐（对齐他的 align-middle + translate） */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.25em 0.55em;
  margin-inline: 0.1em;
  border-radius: 999px; /* 胶囊，verify 豁免 */
  background: var(--me-fill);
  color: var(--me-ink);
  line-height: 1;
  vertical-align: middle;
  translate: 0 -0.06em;
  transition: background-color 0.2s;
}
.pill:hover { background: var(--me-fill-hover); }
.pill-ico {
  width: 14px;
  height: 14px;
  display: block;
  flex-shrink: 0;
}
.pill:focus-visible { outline: 2px solid var(--me-line); outline-offset: 2px; }

/* 链接：统一配色 + 静态细下划线 + hover 从左画出（对齐 sanyam.sh 的 link-underline-draw） */
.lnk {
  position: relative;
  color: var(--me-link);
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.13em;
  text-decoration-color: var(--me-line);
  transition: color 0.2s, text-decoration-color 0.2s;
}
.lnk::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.13em;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: 0 50%;
}
.lnk:hover { text-decoration-color: transparent; }
.lnk:hover::after {
  animation: link-underline-draw 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.lnk:focus-visible { outline: 2px solid var(--me-line); outline-offset: 2px; }

@keyframes link-underline-draw {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* 页脚：签名 + 小图标，与正文之间一条极淡的线 */
.me-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--me-line);
  padding-top: var(--space-4);
}
.me-sign {
  font-family: 'Caveat', cursive;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--me-ink);
  translate: 0 -0.1em;
  rotate: -2deg;
}
.me-icons { display: flex; align-items: center; gap: var(--space-4); }
.me-ico {
  display: inline-flex;
  align-items: center;
  color: var(--me-soft);
  transition: color 0.2s;
}
.me-ico:hover { color: var(--me-ink); }
.me-ico svg, .me-ico img { width: 16px; height: 16px; display: block; }
.me-ico:focus-visible { outline: 2px solid var(--me-line); outline-offset: 2px; }

.me-lang {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  line-height: 1;
}
.me-lang-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1;
  padding: 2px 5px;
  border: 1px solid var(--me-line);
  border-radius: var(--radius-sm);
  color: var(--me-soft);
  transition: color 0.2s, border-color 0.2s;
}
.me-lang:hover .me-lang-btn {
  color: var(--me-ink);
  border-color: var(--me-ink);
}

@media (min-width: 40rem) {
  .me { padding: var(--space-20, 5rem) var(--space-6); }
}
</style>

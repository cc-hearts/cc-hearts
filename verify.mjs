#!/usr/bin/env node
/*
 * verify v0.1 —— 每条铁律至少一个自动检查
 *   X001 裸色值   → 铁律一/二：颜色只允许出现在 tokens.css
 *   X002 冷灰色阶 → 铁律二：禁 Tailwind neutral/gray/slate/zinc
 *   X003 字重超限 → 铁律三：中文 500 封顶，禁合成加粗
 *   X004 硬阴影   → 铁律三：深度用边框/井/whisper/ring
 *   X005 圆角超限 → 铁律三：上限 12px（胶囊 999px 除外）
 *
 * 用法：node verify.mjs [目录或文件...]   （默认扫描当前目录）
 * 例外：那一行行尾加注释 blog:allow 并写明理由；verify.mjs、
 *       SKILL.md、README.md 作为系统自身文件默认跳过。
 * 零依赖，需要 Node 18+。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.output', '.zcode']);
const SKIP_FILES = /^(SKILL|README)\.md$|^verify\.mjs$/i;
const IS_TOKENS = /(^|[\\/])tokens\.css$/i;
const ALLOW = /blog:allow/;
const SCANNED = new Set(['.css', '.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.md', '.mdx']);

const RULES = [
  {
    id: 'X001',
    skip: IS_TOKENS,
    re: /#[0-9a-fA-F]{3,8}\b|rgba?\(/i,
    why: '铁律一/二 · 颜色只能来自 tokens.css，改用 var(--token)',
  },
  {
    id: 'X002',
    re: /(?:text|bg|border|ring|fill|stroke|from|via|to)-(?:neutral|gray|slate|zinc)-\d{2,3}\b/,
    why: '铁律二 · 冷灰会把纸感变成仪表盘感，改用墨/线 token',
  },
  {
    id: 'X003',
    re: /\bfont-(?:semibold|bold|extrabold|black)\b|font-weight\s*:\s*(?:[6-9]\d\d|bold|bolder)\b/,
    why: '铁律三 · 中文 500 封顶，层级靠字号与字族',
  },
  {
    id: 'X004',
    re: /box-shadow\s*:[^;]*?(?:rgba?\(\s*0\s*,\s*0\s*,\s*0|#[0-9a-fA-F]{3,8}\b|\bblack\b)/i,
    why: '铁律三 · 禁硬阴影，用 --line / --paper-sunk / --shadow-whisper / --ring',
  },
  {
    id: 'X005',
    re: /\brounded-(?:2xl|3xl)\b|border-radius\s*:\s*(\d+(?:\.\d+)?)px/,
    why: '铁律三 · 圆角上限 12px（胶囊/头像 999px 除外）',
    check: (m) => m[1] === undefined || (Number(m[1]) > 12 && Number(m[1]) < 100),
  },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_FILES.test(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* walk(p);
    } else if (SCANNED.has(extname(name).toLowerCase())) {
      yield p;
    }
  }
}

const targets = process.argv.slice(2);
const roots = targets.length > 0 ? targets : ['.'];
const violations = [];
let checked = 0;

for (const root of roots) {
  const st = statSync(root);
  const files = st.isDirectory() ? [...walk(root)] : [root];
  for (const file of files) {
    const rel = relative('.', file) || file;
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (ALLOW.test(line)) return;
      for (const rule of RULES) {
        if (rule.skip && rule.skip.test(rel)) continue;
        const m = line.match(rule.re);
        if (m && (!rule.check || rule.check(m))) {
          violations.push(`${rel}:${i + 1}  ${rule.id}  ${rule.why}\n    ${line.trim().slice(0, 80)}`);
        }
      }
    });
    checked++;
  }
}

if (violations.length > 0) {
  console.error(`\n✗ verify：${violations.length} 处违反铁律（检查了 ${checked} 个文件）\n`);
  for (const v of violations) console.error(v + '\n');
  console.error('确需例外：那一行行尾加注释 blog:allow，并写明理由。');
  process.exit(1);
} else {
  console.log(`✓ verify：${checked} 个文件全部通过。verify 只证明没违反铁律，好不好看请对照主张自查。`);
}

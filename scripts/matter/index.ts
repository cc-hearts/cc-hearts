import { resolve } from 'path'
import { glob } from 'glob'
import { readFileCTimes, writeFile } from './file.js'
import { replaceMdMatterDate, replaceMdMatterUniqueId } from './matcher.js'
import { readFileSync } from 'fs'
function _resolve(path: string) {
  return resolve(process.cwd(), path)
}
async function readMdPath() {
  return await glob(_resolve('./src/pages/**/*.md'), {
    ignore: _resolve('./src/pages/index.md'),
  })
}

;(async () => {
  const files = await readMdPath()
  if (Array.isArray(files)) {
    files.forEach((path) => {
      const cTimes = readFileCTimes(path)
      const md = readFileSync(path, 'utf-8')
      let replacedMd: string | undefined = replaceMdMatterDate(md, {
        date: cTimes,
      })
      if (replacedMd) {
        replacedMd = replaceMdMatterUniqueId(replacedMd)
      }
      if (replacedMd) writeFile(path, replacedMd)
    })
  }
})()

import { readFileSync, writeFileSync } from 'fs'
import { getMarkdownPath } from '../utils/path.js'
import { matterTransformObject } from '../matter/shard.js'
import matter from 'gray-matter'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import toc from 'markdown-toc'
import { Slug } from '../../src/types/types.js'
export async function genHeader() {
  const markdownPath = await getMarkdownPath()
  await Promise.all(
    markdownPath.map(async (path) => {
      const mdFile = readFileSync(path, 'utf-8')
      const matterObj = matterTransformObject(mdFile)
      const slug = toc(matter(mdFile).content, {}) as unknown as {
        json: Array<Slug>
      }
      const header = (slug.json || []).find((target) => target.lvl === 1)
      if (header || matterObj.genHeader) {
        return
      }
      // 在matter后面插入标题
      const headerStr = `\n# ${matterObj.title}\n`
      const replaceFile = mdFile.replace(
        /^---[\w\W]*?---(\s)/gm,
        function (matcher) {
          console.log(matcher)
          return matcher + headerStr
        }
      )
      writeFileSync(path, replaceFile)
      console.log(`gen header ${path} success`)
    })
  )
}

genHeader()

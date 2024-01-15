import { readFile, readdir, writeFile } from 'fs/promises'
import { relative, resolve } from 'path'
import {
  matterTransformObject,
  objectTransformMatter,
} from '../../scripts/matter/shard'
import { globSync } from 'glob'
import { isDirectory } from '@cc-heart/utils-service'

interface DirOptions {
  dir: string
  output: string
  exclude?: Array<string>
}

interface GenMarkdownPathConfigOptions {
  config: Array<DirOptions>
}

interface MarkdownPathConfig {
  text: string
  path: string
}

async function getMarkdownFrontmatter(path: string) {
  const file = await readFile(path, 'utf-8')
  return matterTransformObject(file)
}

async function readMarkdownPath(
  dir: string,
  output: string,
  excludes: Array<string> = []
) {
  const markdownPathConfig: Array<MarkdownPathConfig> = []
  try {
    const dirOptions = await readdir(dir, { withFileTypes: true })
    const task = dirOptions.map(async (option) => {
      if (option.isFile()) {
        const markdownPath = resolve(dir, option.name)
        if (markdownPath === output) return
        const frontmatter = (await getMarkdownFrontmatter(markdownPath)) || {}
        markdownPathConfig.push({
          text: frontmatter.title,
          path: markdownPath,
        })
      } else if (option.isDirectory()) {
        const pathConfig =
          (await readMarkdownPath(
            resolve(dir, option.name),
            output,
            excludes
          )) || []
        markdownPathConfig.push(...pathConfig)
      }
    })
    await Promise.all(task)
    return markdownPathConfig
  } catch (e) {
    console.log('[readMarkdownPath] error', e)
  }
}
/**
 * Generate the configuration path for markdown
 * @returns
 */
export function genMarkdownPathConfig(options: GenMarkdownPathConfigOptions) {
  return {
    name: 'genMarkdownPathConfig',
    buildStart() {
      const config = options?.config || []

      config.forEach(async (item) => {
        const dirs = globSync(item.dir) || []

        const isAbsoluteOutput = !/\.\//.test(item.output)
        const excludes = (item.exclude || []).map((item) =>
          resolve(process.cwd(), item)
        )

        dirs.forEach(async (dir) => {
          if (!(await isDirectory(dir))) return
          const outputPath = isAbsoluteOutput
            ? item.output
            : resolve(dir, item.output)

          const config = await readMarkdownPath(dir, outputPath, excludes)

          const frontmatter = await getMarkdownFrontmatter(outputPath)
          let matter = ''
          if (frontmatter) {
            matter = objectTransformMatter(frontmatter)
          }
          const linkStr =
            config
              ?.map(
                (record) => `- [${record.text}](${relative(dir, record.path)})`
              )
              .join('\n') || ''
          const outputStr = `${matter}\n\n${linkStr}\n`
          writeFile(outputPath, outputStr, 'utf-8')
        })
      })
    },
  }
}

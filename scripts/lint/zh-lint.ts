import { exec } from 'child_process'
import { getMarkdownPath } from '../utils/path.js'

async function lintAnfFix() {
  const markdownPath = await getMarkdownPath()

  await Promise.all(
    markdownPath.map(async (path) => {
      return new Promise<void>((resolve) => {
        exec(`npx zhlint ${path} --fix`, (err) => {
          if (err) {
            console.log(`lint ${path} error: ${err}`)
            return
          }
          console.log(`lint ${path} success`)
          resolve()
        })
      })
    })
  )
}

lintAnfFix()

import { exec } from 'child_process'
import { readdir } from 'fs/promises'
import { resolve as _resolve } from 'path'

const resolve = (...args: string[]) => _resolve(process.cwd(), ...args)

async function searchMdFilePath(path: string) {
  const dirs = await readdir(resolve(path), { withFileTypes: true })
  const filePaths: string[] = []

  await Promise.all(
    dirs.map(async (dir) => {
      if (dir.isDirectory()) {
        filePaths.push(...(await searchMdFilePath(resolve(path, dir.name))))
      } else {
        if (dir.name.endsWith('.md')) filePaths.push(resolve(path, dir.name))
      }
    })
  )

  return filePaths
}

async function lintAnfFix() {
  const markdownPath = await Promise.all(
    ['src', 'draft'].map(async (pathName) => {
      return searchMdFilePath(pathName)
    })
  ).then((filePathList) => {
    return filePathList.flat()
  })

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

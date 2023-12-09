import { readdir } from 'fs/promises'
import { resolve as _resolve } from 'path'
export const resolve = (...args: string[]) => _resolve(process.cwd(), ...args)

export async function searchMdFilePath(path: string) {
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

export async function getMarkdownPath() {
  return await Promise.all(
    ['src'].map(async (pathName) => {
      return searchMdFilePath(pathName)
    })
  ).then((filePathList) => {
    return filePathList.flat()
  })
}

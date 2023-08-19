import { isAbsolute, relative } from 'node:path'

export function isPathWithIn(targetPath: string, parentPath: string) {
  const relativePath = relative(parentPath, targetPath)
  return !relativePath.startsWith('..') && !isAbsolute(relativePath)
}

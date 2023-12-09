import { join } from 'node:path'
import { isPathWithIn } from './utils/validate'

export function isDraftPath(path: string) {
  const draftPath = join(process.cwd(), 'src/draft')
  return isPathWithIn(path, draftPath)
}

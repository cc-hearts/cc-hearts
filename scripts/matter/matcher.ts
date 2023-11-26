import { hasOwn } from '@cc-heart/utils'
import {
  objectTransformMatter,
  matterTransformObject,
  replaceMatter,
} from './shard.js'
import { randomUUID } from 'crypto'

export function replaceMdMatterDate(
  md: string,
  defaultMatters: Record<string, string>
) {
  const metaVal = matterTransformObject(md)
  if (hasOwn(metaVal, 'date')) return md
  const matter = objectTransformMatter({ ...metaVal, ...defaultMatters })
  return replaceMatter(md, matter)
}

// unique ids are generated for each post
const ids = new Set<string>()

export function clearIds() {
  ids.clear()
}

export function replaceMdMatterUniqueId(md: string) {
  const matter = matterTransformObject(md)
  if (hasOwn(matter, 'articleId')) return md
  let articleId = randomUUID()
  while (ids.has(articleId)) {
    articleId = randomUUID()
  }
  ids.add(articleId)
  const matterStr = objectTransformMatter({ ...matter, articleId })
  return replaceMatter(md, matterStr)
}

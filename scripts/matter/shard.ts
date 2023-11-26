export function objectTransformMatter(data: Record<string, string>) {
  let matter = '---\n'
  Object.entries(data).forEach(([key, value]) => {
    matter += `${key}: ${value}\n`
  })
  return `${matter}---`
}
export const matchMatterRegex = /^---[\w\W]*?---/gm

export function matterTransformObject(md: string) {
  const [matcher] = md.trim().match(matchMatterRegex) || []
  if (typeof matcher === 'string') {
    let matterList = matcher.split('\n')
    const len = matterList.length
    matterList = matterList.slice(1, len - 1)
    return matterList.reduce<Record<string, string>>((acc, matter) => {
      const [key, value] = matter.split(':')
      acc[key] = value.trim()
      return acc
    }, {})
  }
  return {}
}

export function replaceMatter(md: string, matter: string) {
  return md.replace(matchMatterRegex, matter)
}

import GithubSlugger from 'github-slugger'

export function generatorRightSide(slug) {
  const content = slug.content.split('\n')
  const titleReg = /(?<=\[).*?(?=\])/g
  // const attrIdReg = /(?<=\(#).*?(?=\))/g
  return content.reduce((acc, cur) => {
    const name = cur.match(titleReg)?.[0]
    // const attrId = cur.match(attrIdReg)?.[0]
    acc.push({
      name,
      attrId: encodeURIComponent(new GithubSlugger().slug(name)),
    })
    return acc
  }, [])
}

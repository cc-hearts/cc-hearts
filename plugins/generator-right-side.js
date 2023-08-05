import GithubSlugger from 'github-slugger'

/**
 * @param {import('../src/types/types').Slug} slug
 * @returns
 */
export function generatorRightSide(slug) {
  return slug.map((val) => {
    return {
      ...val,
      attrId: encodeURIComponent(new GithubSlugger().slug(val.content)),
    }
  })
}

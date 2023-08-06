function parseTitle(title) {
  return title.replace(/\s+/g, '-')
}
/**
 * @param {import('../src/types/types').Slug} slug
 * @returns
 */
export function generatorRightSide(slug) {
  return slug.map((val) => {
    return {
      ...val,
      attrId: encodeURIComponent(parseTitle(val.content)),
    }
  })
}

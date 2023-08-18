function parseTitle(title) {
  return title.replace(/\s+/g, '-').replace(/`/g, '').toLowerCase()
}
function parseContent(content) {
  return content.replace(/`/g, '')
}
/**
 * @param {import('../src/types/types').Slug} slug
 * @returns
 */
export function generatorRightSide(slug) {
  return slug.map((val) => {
    const { content } = val
    return {
      ...val,
      content: parseContent(content),
      attrId: encodeURIComponent(parseTitle(val.content)),
    }
  })
}

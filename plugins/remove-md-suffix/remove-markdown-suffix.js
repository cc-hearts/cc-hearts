export function removeMarkdownSuffix(md) {
  md.core.ruler.push('remove-markdown-suffix', function (state) {
    state.tokens.reduce((acc, token) => {
      if (token.type === 'inline') {
        const linkOpen = token.children.find(
          (target) => target.type === 'link_open'
        )
        if (linkOpen && linkOpen.tag === 'a') {
          const { attrs } = linkOpen
          const [attr, value] = attrs[0] || []
          if (attr === 'href') {
            attrs[0][1] = value.replace(/\.md$/, '')
          }
        }
      }
      return acc
    })
  })
}

import { isUndef } from '@cc-heart/utils'

export function removeH1Header(md) {
  md.core.ruler.push('remove-h1-header', function (state) {
    const [start, end] = state.tokens.reduce((acc, token, index) => {
      if (
        token.type === 'heading_open' ||
        (token.type === 'heading_close' && token.tag === 'h1')
      ) {
        acc.push(index)
      }

      return acc
    }, [])

    if (!isUndef(start) && !isUndef(end)) {
      state.tokens.splice(start, end + 1)
    }
  })
}

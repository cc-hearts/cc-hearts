import { it, expect, describe } from 'vitest'
import { matterTransformObject } from '../../scripts/matter/shard'

describe('shard module test', () => {
  it('return a empty object when markdown have not matter', () => {
    const markdown = '# h1 \n this is article.'
    expect(matterTransformObject(markdown)).toEqual({})
  })

  it('return a matter parsed object when markdown have matter attribute', () => {
    const markdown = `---\ntitle:matterTransformObjectTest\ndate:2023-01-01\n---`
    expect(matterTransformObject(markdown)).toEqual({
      title: 'matterTransformObjectTest',
      date: '2023-01-01',
    })
  })
})

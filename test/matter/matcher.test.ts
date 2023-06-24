import { describe, it, expect } from 'vitest'
import { replaceMdMatter } from '../../scripts/matter/matcher'

describe('replaceMdMatter function test', () => {
  it('replaceMdMatter function test', () => {
    const markdown = `---\ntitle: Front Matter\n---\nThis is content.`
    const defaultMatters = {
      date: '2022-01-01',
    }
    expect(replaceMdMatter(markdown, defaultMatters)).toEqual(
      '---\ntitle: Front Matter\ndate: 2022-01-01\n---\nThis is content.'
    )
  })
})

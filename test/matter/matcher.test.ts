import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  replaceMdMatterDate,
  replaceMdMatterUniqueId,
  clearIds,
} from '../../scripts/matter/matcher'

let randomCount = 0

vi.mock('crypto', () => {
  return {
    randomUUID: vi.fn(() => {
      if (randomCount < 2) {
        randomCount++
        return '4bd72e52-922e-41cc-9af8-11d7102848e9'
      }
      return '44c1b671-788a-4cdc-948e-62a58bc3b824'
    }),
  }
})

describe('matter module test', () => {
  beforeEach(() => {
    randomCount = 0
    clearIds()
  })

  it('use default matters when markdown matter have not date attribute', () => {
    const markdown = `---\ntitle: Front Matter\n---\nThis is content.`
    const defaultMatters = {
      date: '2022-01-01',
    }
    expect(replaceMdMatterDate(markdown, defaultMatters)).toEqual(
      '---\ntitle: Front Matter\ndate: 2022-01-01\n---\nThis is content.'
    )
  })

  it('use markdown date attribute when markdown matter have date attribute', () => {
    const markdown = `---\ntitle: Front Matter\ndate:2022-01-01\n---\nThis is content.`
    const defaultMatters = {
      dare: '2023-12-12',
    }

    expect(replaceMdMatterDate(markdown, defaultMatters)).toEqual(
      '---\ntitle: Front Matter\ndate:2022-01-01\n---\nThis is content.'
    )
  })

  it('generator a unique id when markdown matter have not articleId attribute', () => {
    const markdown = `---\ntitle: Front Matter\n---\nThis is content.`

    expect(replaceMdMatterUniqueId(markdown)).toEqual(
      `---\ntitle: Front Matter\narticleId: 4bd72e52-922e-41cc-9af8-11d7102848e9\n---\nThis is content.`
    )
  })

  it('use default articleId when markdown matter have articleId attribute', () => {
    const markdown = `---\ntitle: Front Matter\narticleId: 5969ba76-f0f8-4a20-b78d-7b25bf69edc9\n---\nThis is content.`
    expect(replaceMdMatterUniqueId(markdown)).toEqual(markdown)
  })

  it('generator a new articleId when markdowns exist duplicate articleId', () => {
    const markdown = `---\n---\n # this is first pages`
    const markdown2 = `---\n---\n # this is second pages`

    expect(replaceMdMatterUniqueId(markdown)).toEqual(
      `---\narticleId: 4bd72e52-922e-41cc-9af8-11d7102848e9\n---\n # this is first pages`
    )
    expect(replaceMdMatterUniqueId(markdown2)).toEqual(
      `---\narticleId: 44c1b671-788a-4cdc-948e-62a58bc3b824\n---\n # this is second pages`
    )
  })
})

export interface IFrontmatter {
  title?: string
  description?: string
  time?: string
  _meta?: IMeta
  isDraft: boolean
  articleId: string
}
interface IMeta {
  hidden?: boolean
}

export interface IReadTIme {
  minutes: number
  time: number
  words: number
}
export interface IPosts {
  title?: string
  path: string
  month: string
  date: number
  time: Date
  draft: boolean
}

export interface Slug {
  content: string
  slug: string
  lvl: number
  i: number
  seen: number
  attrId: string
}

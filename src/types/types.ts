export interface IFrontmatter {
  title?: string
  description?: string
  time?: string
}

export interface IPosts {
  title?: string
  path: string
  month: string
  date: number
  time: Date
}

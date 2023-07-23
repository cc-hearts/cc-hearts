export interface IFrontmatter {
  title?: string
  description?: string
  time?: string
  _meta?: IMeta
}
interface IMeta {
  hidden?: boolean
}
export interface IPosts {
  title?: string
  path: string
  month: string
  date: number
  time: Date
}

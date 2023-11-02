import { defaultNamespace } from '@/configs'

export function useDerivedNamespace(ns?: string) {
  return ns || defaultNamespace
}
export function useCssNamespace(
  block?: string | number,
  overrideNamespace?: string
) {
  const ns = useDerivedNamespace(overrideNamespace)
  const cls = block ? `${ns}-${block}` : ns

  const b = (blockSuffix?: string) => {
    return blockSuffix ? `${cls}-${blockSuffix}` : cls
  }

  const e = (element?: string) => {
    return element ? `${cls}__${element}` : cls
  }

  const m = (modifier?: string) => {
    return modifier ? `${cls}--${modifier}` : cls
  }
  const be = (blockSuffix?: string, element?: string) => {
    return (blockSuffix && element && `${cls}-${blockSuffix}__${element}`) || ''
  }

  const bm = (blockSuffix?: string, modifier?: string) => {
    return (
      (blockSuffix && modifier && `${cls}-${blockSuffix}--${modifier}`) || ''
    )
  }

  const em = (element?: string, modifier?: string) => {
    return (element && modifier && `${cls}__${element}--${modifier}`) || ''
  }

  const bem = (blockSuffix?: string, element?: string, modifier?: string) => {
    return (
      (blockSuffix &&
        element &&
        modifier &&
        `${cls}-${blockSuffix}__${element}--${modifier}`) ||
      ''
    )
  }

  const genCssVar = (target: Record<string, string>) => {
    const styles: Record<string, string> = {}
    Object.keys(target).forEach((key) => {
      if (target[key]) {
        styles[`--${cls}-${key}`] = target[key]
      }
    })
    return styles
  }

  const getCssVar = (key: string) => `--${cls}-${key}`

  return {
    cls,
    b,
    e,
    m,
    be,
    bm,
    em,
    bem,
    genCssVar,
    getCssVar,
  }
}

export type useCssNamespace = ReturnType<typeof useCssNamespace>

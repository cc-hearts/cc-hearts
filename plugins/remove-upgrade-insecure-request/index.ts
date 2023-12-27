export function removeUpgradeInsecureRequest() {
  return {
    name: 'remove-upgrade-insecure-requests',
    transformIndexHtml(html: string) {
      const reg = /<meta\b[^>]*content="upgrade-insecure-requests"[^>]*>/gm
      return html.replace(reg, '')
    },
  }
}

module.exports = function (md) {
  // 渲染代码块
  md.renderer.rules.fence = function (tokens, idx, options) {
    const token = tokens[idx]
    const code = token.content
    const lang = token.info ? token.info.trim() : ''
    const escapeHtmlCode = md.utils.escapeHtml(code)
    const highlighted = options.highlight(code, lang) || escapeHtmlCode

    // 生成复制按钮
    const btnHtml =
      '<button class="copy-btn" value="' +
      escapeHtmlCode +
      '" onclick="__copyCode(this)">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M216 34H88a6 6 0 0 0-6 6v42H40a6 6 0 0 0-6 6v128a6 6 0 0 0 6 6h128a6 6 0 0 0 6-6v-42h42a6 6 0 0 0 6-6V40a6 6 0 0 0-6-6Zm-54 176H46V94h116Zm48-48h-36V88a6 6 0 0 0-6-6H94V46h116Z"/></svg>' +
      '</button>'

    // 生成代码块的容器
    const container =
      '<div class="code-container">' + highlighted + btnHtml + '</div>'
    return container
  }
}

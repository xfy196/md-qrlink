import mime from "mime"
/**
 * 触发浏览器下载文本内容，文件名与扩展名由调用方传入。
 * @param {string} content - 需要保存的文本内容。
 * @param {string} filename - 不含扩展名的文件名。
 * @param {string} extension - 文件扩展名，支持自定义（无需带.）。
 */
export function downloadTextFile(content, filename = "hello", extension = 'txt') {
  if (typeof content !== 'string') {
    throw new Error('downloadTextFile: content 必须是字符串');
  }
  if (!filename) {
    throw new Error('downloadTextFile: filename 不能为空');
  }
  const sanitizedExt = extension ? extension.replace(/^\./, '') : '';
  const mimeType = mime.getType(sanitizedExt)
  const fullName = sanitizedExt ? `${filename}.${sanitizedExt}` : filename;
  const blob = new Blob([content], {type: `${mimeType};charset=utf-8`});

  // 兼容旧版 Edge / IE
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, fullName);
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fullName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


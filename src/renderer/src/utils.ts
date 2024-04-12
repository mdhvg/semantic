export function cleanHTML(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('button, script, style, link, meta').forEach((e) => e.remove())
  doc.querySelectorAll('*').forEach((e) => {
    for (const attr of e.getAttributeNames()) {
      if (attr.startsWith('on')) {
        e.removeAttribute(attr)
      }
    }
  })
  return doc.body.innerHTML
}

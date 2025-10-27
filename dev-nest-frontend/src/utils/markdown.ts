const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const formatInline = (value: string): string => {
  let result = value

  result = result.replace(/`([^`]+)`/g, (_match, code: string) => `<code>${code}</code>`)
  result = result.replace(/\*\*([^*]+)\*\*/g, (_match, bold: string) => `<strong>${bold}</strong>`)
  result = result.replace(/__([^_]+)__/g, (_match, bold: string) => `<strong>${bold}</strong>`)
  result = result.replace(/\*(?!\s)([^*]+?)\*/g, (_match, italic: string) => `<em>${italic}</em>`)
  result = result.replace(/_(?!\s)([^_]+?)_/g, (_match, italic: string) => `<em>${italic}</em>`)
  result = result.replace(/~~([^~]+)~~/g, (_match, text: string) => `<del>${text}</del>`)

  result = result.replace(
    /!\[([^\]]*)\]\((https?:[^)\s]+)\)/g,
    (_match, alt: string, src: string) => `<img src="${src}" alt="${alt}" />`,
  )

  result = result.replace(
    /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
    (_match, text: string, href: string) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`,
  )

  return result
}

const flushParagraph = (buffer: string[], output: string[]) => {
  if (buffer.length === 0) {
    return
  }
  const text = buffer.join('\n')
  const escaped = escapeHtml(text).replace(/\n/g, '<br />')
  output.push(`<p>${formatInline(escaped)}</p>`)
  buffer.length = 0
}

const flushList = (
  listType: 'ul' | 'ol' | null,
  items: string[],
  output: string[],
) => {
  if (!listType || items.length === 0) {
    return { type: null as 'ul' | 'ol' | null, items: [] as string[] }
  }
  output.push(`<${listType}>${items.join('')}</${listType}>`)
  return { type: null as 'ul' | 'ol' | null, items: [] as string[] }
}

const flushBlockquote = (buffer: string[], output: string[]) => {
  if (buffer.length === 0) {
    return
  }
  output.push(`<blockquote>${buffer.join('<br />')}</blockquote>`)
  buffer.length = 0
}

const flushCodeBlock = (
  language: string,
  lines: string[],
  output: string[],
) => {
  const escapedLines = lines.map((line) => escapeHtml(line)).join('\n')
  const langClass = language ? ` class="language-${escapeHtml(language)}"` : ''
  output.push(`<pre><code${langClass}>${escapedLines}</code></pre>`)
}

export const renderMarkdown = (source: string): string => {
  if (!source) {
    return ''
  }

  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const output: string[] = []
  const paragraphBuffer: string[] = []
  const blockquoteBuffer: string[] = []

  let listState: { type: 'ul' | 'ol' | null; items: string[] } = {
    type: null,
    items: [],
  }

  let inCodeBlock = false
  let codeLanguage = ''
  let codeLines: string[] = []

  const closeOpenStructures = () => {
    listState = flushList(listState.type, listState.items, output)
    flushParagraph(paragraphBuffer, output)
    flushBlockquote(blockquoteBuffer, output)
  }

  lines.forEach((rawLine) => {
    const line = rawLine
    const trimmed = line.trim()

    if (inCodeBlock) {
      if (trimmed.startsWith('```')) {
        flushCodeBlock(codeLanguage, codeLines, output)
        inCodeBlock = false
        codeLanguage = ''
        codeLines = []
      } else {
        codeLines.push(line)
      }
      return
    }

    if (trimmed.startsWith('```')) {
      closeOpenStructures()
      inCodeBlock = true
      codeLanguage = trimmed.slice(3).trim()
      codeLines = []
      return
    }

    if (trimmed === '') {
      closeOpenStructures()
      return
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      closeOpenStructures()
      output.push('<hr />')
      return
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      closeOpenStructures()
      const level = headingMatch[1].length
      const text = escapeHtml(headingMatch[2])
      output.push(`<h${level}>${formatInline(text)}</h${level}>`)
      return
    }

    const blockquoteMatch = trimmed.match(/^>\s?(.*)$/)
    if (blockquoteMatch) {
      paragraphBuffer.length = 0
      listState = flushList(listState.type, listState.items, output)
      blockquoteBuffer.push(formatInline(escapeHtml(blockquoteMatch[1])))
      return
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/)
    if (unorderedMatch) {
      flushParagraph(paragraphBuffer, output)
      flushBlockquote(blockquoteBuffer, output)
      if (listState.type !== 'ul') {
        listState = flushList(listState.type, listState.items, output)
        listState.type = 'ul'
      }
      listState.items.push(`<li>${formatInline(escapeHtml(unorderedMatch[1]))}</li>`)
      return
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (orderedMatch) {
      flushParagraph(paragraphBuffer, output)
      flushBlockquote(blockquoteBuffer, output)
      if (listState.type !== 'ol') {
        listState = flushList(listState.type, listState.items, output)
        listState.type = 'ol'
      }
      listState.items.push(`<li>${formatInline(escapeHtml(orderedMatch[2]))}</li>`)
      return
    }

    if (blockquoteBuffer.length > 0) {
      flushBlockquote(blockquoteBuffer, output)
    }
    if (listState.type) {
      listState = flushList(listState.type, listState.items, output)
    }

    paragraphBuffer.push(line)
  })

  if (inCodeBlock) {
    flushCodeBlock(codeLanguage, codeLines, output)
  }

  closeOpenStructures()

  return output.join('\n')
}

export const escapeUnsafeHtml = (html: string | null | undefined): string => {
  if (!html) {
    return ''
  }
  return escapeHtml(html)
}

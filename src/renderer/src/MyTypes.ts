export type DocumentRecordMap = {
  [key: string]: DocumentRecord
}

export const MimeTypes = ['text/markdown', 'text/plain', 'text/html'] as const

export type Mime = (typeof MimeTypes)[number]

export type DocumentRecord = {
  meta: {
    color?: string
    starred?: boolean
    title: string
    displayText?: string
    mime: Mime
    deleted_status?: boolean
    deleted_timeLeft?: number
  }
  plainText: string
}

export function emptyDocumentRecord(): DocumentRecord {
  return {
    meta: {
      title: '',
      mime: 'text/markdown'
    },
    plainText: ''
  }
}

export type DocumentFetchType = {
  ids: string[]
  data?: any[]
  documents?: string[] // PlainText
  embeddings?: number[][]
  metadatas: {
    color?: string
    starred?: boolean
    title: string
    mime: Mime
    displayText?: string
    deleted_status?: boolean
    deleted_timeLeft?: number
  }[]
  uris: string[]
}
export type DocumentLoadStatus = {
  [key: string]: boolean
}

export type RenderListType = {
  id: string
  title: string
}

export type SearchRenderListType = RenderListType & { distance: number }

export type SearchResultsType = {
  [key: string]: DocumentRecord & { distance: number }
}

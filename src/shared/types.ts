import { TypedDocument, Orama } from '@orama/orama'

export enum ServerStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED'
}

export type Document = {
  id: string
  title: string
  content: string
}

export const vectorSize = 1000

export enum MimeType {
  Markdown = 'text/markdown',
  PlainText = 'text/plain',
  HTML = 'text/html'
}

export const MetadataSchema = {
  id: 'string',
  title: 'string',
  mime: 'enum',
  deleted: 'boolean',
  deletedTimeLeft: 'number',
  vector: `vector[${vectorSize}]`
} as const

export type FetchDocument = () => TypedDocument<Orama<typeof MetadataSchema>>

export type DocumentMap = {
  [key: string]: FetchDocument
}

export type DocumentStatus =
  | {
    [key: string]: {
      loaded: true
      content: string
    }
  }
  | {
    [key: string]: {
      loaded: false
    }
  }
